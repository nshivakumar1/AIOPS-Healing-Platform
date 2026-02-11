resource "aws_security_group" "elk" {
  name        = "${var.environment}-elk-sg"
  description = "Security group for ELK stack"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 5601
    to_port     = 5601
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # For demo/dev. In prod, strict IP restriction.
    description = "Kibana"
  }

  ingress {
    from_port   = 5044
    to_port     = 5044
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
    description = "Logstash Beats"
  }
  
  ingress {
    from_port   = 9200
    to_port     = 9200
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
    description = "Elasticsearch API"
  }
  
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Optional for debugging
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

resource "aws_instance" "elk" {
  ami           = data.aws_ami.amazon_linux_2.id
  instance_type = "t3.medium" # Minimum for ELK
  subnet_id     = var.subnet_id
  vpc_security_group_ids = [aws_security_group.elk.id]
  iam_instance_profile   = aws_iam_instance_profile.elk_profile.name

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              amazon-linux-extras install docker -y
              service docker start
              usermod -a -G docker ec2-user
              chkconfig docker on
              
              # Install Docker Compose
              curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
              chmod +x /usr/local/bin/docker-compose

              # Create ELK Directory
              mkdir -p /home/ec2-user/elk
              cd /home/ec2-user/elk

              # Create docker-compose.yml
              cat <<EOT > docker-compose.yml
              version: '3.7'
              services:
                elasticsearch:
                  image: docker.elastic.co/elasticsearch/elasticsearch:7.17.9
                  environment:
                    - discovery.type=single-node
                    - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
                  ports:
                    - "9200:9200"
                  volumes:
                    - es_data:/usr/share/elasticsearch/data
                
                kibana:
                  image: docker.elastic.co/kibana/kibana:7.17.9
                  ports:
                    - "5601:5601"
                  environment:
                    - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
                  depends_on:
                    - elasticsearch

                logstash:
                  image: docker.elastic.co/logstash/logstash:7.17.9
                  ports:
                    - "5044:5044"
                    - "5000:5000"
                  volumes:
                    - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
                  depends_on:
                    - elasticsearch
              volumes:
                es_data:
              EOT

              # Create Logstash Config
              cat <<EOT > logstash.conf
              input {
                beats {
                  port => 5044
                }
              }
              output {
                elasticsearch {
                  hosts => ["elasticsearch:9200"]
                  index => "aiops-logs-%%{+YYYY.MM.dd}"
                }
              }
              EOT

              # Start ELK
              /usr/local/bin/docker-compose up -d
              EOF

  tags = {
    Name = "${var.environment}-elk-stack"
  }
}

# IAM Role for SSM Access (Debugging without SSH)
resource "aws_iam_role" "elk_role" {
  name = "${var.environment}-elk-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ssm_policy" {
  role       = aws_iam_role.elk_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "elk_profile" {
  name = "${var.environment}-elk-profile"
  role = aws_iam_role.elk_role.name
}

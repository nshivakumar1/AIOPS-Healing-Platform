output "elk_instance_id" {
  value = aws_instance.elk.id
}

output "elk_public_ip" {
  value = aws_instance.elk.public_ip
}

output "kibana_url" {
  value = "http://${aws_instance.elk.public_ip}:5601"
}

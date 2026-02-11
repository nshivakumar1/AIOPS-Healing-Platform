terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "local" {
    path = "terraform.tfstate"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "aiops-platform"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

module "vpc" {
  source = "./modules/vpc"
  
  vpc_cidr             = var.vpc_cidr
  availability_zones   = var.availability_zones
  environment          = var.environment
}

module "ecr" {
  source = "./modules/ecr"
  environment = var.environment
}

module "ecs" {
  source = "./modules/ecs"

  vpc_id                     = module.vpc.vpc_id
  public_subnets             = module.vpc.public_subnets
  environment                = var.environment
  ecr_repository_url         = module.ecr.repository_url
  backend_ecr_repository_url = module.ecr.backend_repository_url
  
  depends_on = [module.vpc, module.ecr]
}

module "frontend" {
  source = "./modules/frontend"

  bucket_name = "aiops-frontend-${var.environment}-${random_id.suffix.hex}"
  environment = var.environment
}

module "elk" {
  source = "./modules/elk"

  vpc_id      = module.vpc.vpc_id
  vpc_cidr    = var.vpc_cidr
  subnet_id   = module.vpc.public_subnets[0] # Put in first public subnet for access
  environment = var.environment
  
  depends_on = [module.vpc]
}

resource "random_id" "suffix" {
  byte_length = 4
}

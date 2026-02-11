output "repository_url" {
  value = aws_ecr_repository.app.repository_url
}

output "backend_repository_url" {
  value = aws_ecr_repository.backend.repository_url
}

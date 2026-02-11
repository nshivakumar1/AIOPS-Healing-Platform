output "cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "alb_dns_name" {
  value = aws_lb.main.dns_name
}

output "lb_security_group_id" {
  value = aws_security_group.lb.id
}

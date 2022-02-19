output "table_arn" {
  value = aws_dynamodb_table.task_table.arn
}

output "table_name" {
  value = aws_dynamodb_table.task_table.name
}

output "gsis" {
  value = aws_dynamodb_table.task_table.global_secondary_index
}

output "stream_arn" {
  value = aws_dynamodb_table.task_table.stream_arn
}

output "queue_url" {
  value = aws_sqs_queue.queue.id
}

output "queue_arn" {
  value = aws_sqs_queue.queue.arn
}

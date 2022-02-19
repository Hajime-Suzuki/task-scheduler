
resource "aws_dynamodb_table" "task_table" {
  name      = "scheduler-poc-task-table"
  hash_key  = "userId"
  range_key = "requestId"

  stream_enabled   = true
  stream_view_type = "NEW_IMAGE"

  billing_mode = "PAY_PER_REQUEST"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "requestId"
    type = "S"
  }

  attribute {
    name = "dueDate"
    type = "S"
  }

  global_secondary_index {
    name            = "BY_DUE_DATE"
    hash_key        = "dueDate"
    range_key       = "requestId"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }
}

resource "aws_sqs_queue" "queue" {
  name = "scheduler-poc-processed-task-queue"
}


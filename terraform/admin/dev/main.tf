
## LocalStack
provider "aws" {
  region                      = "us-east-1"
  access_key                  = "test"
  secret_key                  = "test"
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true

  endpoints {
    dynamodb = "http://localhost:4566"
  }
}
##################

resource "aws_dynamodb_table" "admin" {
  name         = "${var.admin_table_name}-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  # chave primária
  attribute {
    name = "id"
    type = "S"
  }

  # atributo usado no GSI
  attribute {
    name = "email"
    type = "S"
  }

  global_secondary_index {
    name            = "email-index"
    hash_key        = "email"
    projection_type = "ALL"
  }

  tags = {
    Name        = "${var.admin_table_name}-${var.environment}"
    Environment = var.environment
  }
}

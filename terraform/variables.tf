variable "project_id" {
  type        = string
  description = "ID del proyecto de GCP"
}

variable "region" {
  type        = string
  description = "Region principal"
  default     = "us-east1"
}

variable "db_name" {
  type        = string
  default     = "restaurantedb"
}

variable "db_user" {
  type        = string
  default     = "postgres"
}

variable "db_password" {
  type        = string
  sensitive   = true
}

variable "image_name" {
  type        = string
  description = "Imagen Docker del backend"
}
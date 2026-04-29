resource "google_cloud_run_v2_service" "backend" {
  name     = "restaurante-backend-tf"
  location = var.region

  template {
    service_account = google_service_account.cloud_run_sa.email

    scaling {
      min_instance_count = 0
      max_instance_count = 1
    }

    containers {
      image = var.image_name

      ports {
        container_port = 3000
      }

      env {
        name  = "DATABASE_URL"
        value = "postgresql://${var.db_user}:${var.db_password}@${google_sql_database_instance.postgres_instance.public_ip_address}:5432/${var.db_name}"
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }
    }
  }

  depends_on = [
    google_project_service.run_api,
    google_sql_database.database,
    google_sql_user.user
  ]
}

resource "google_cloud_run_v2_service_iam_member" "public_access" {
  location = google_cloud_run_v2_service.backend.location
  name     = google_cloud_run_v2_service.backend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
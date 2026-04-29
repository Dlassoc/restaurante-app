output "cloud_run_url" {
  value = google_cloud_run_v2_service.backend.uri
}

output "cloud_sql_public_ip" {
  value = google_sql_database_instance.postgres_instance.public_ip_address
}

output "artifact_registry_repo" {
  value = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.backend_repo.repository_id}"
}
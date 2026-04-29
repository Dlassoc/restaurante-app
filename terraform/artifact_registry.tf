resource "google_artifact_registry_repository" "backend_repo" {
  location      = var.region
  repository_id = "restaurante-tf-repo"
  description   = "Repositorio Docker para backend restaurante"
  format        = "DOCKER"

  depends_on = [google_project_service.artifact_api]
}
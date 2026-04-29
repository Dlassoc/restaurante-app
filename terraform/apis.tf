resource "google_project_service" "run_api" {
  service = "run.googleapis.com"
}

resource "google_project_service" "sql_api" {
  service = "sqladmin.googleapis.com"
}

resource "google_project_service" "artifact_api" {
  service = "artifactregistry.googleapis.com"
}

resource "google_project_service" "iam_api" {
  service = "iam.googleapis.com"
}
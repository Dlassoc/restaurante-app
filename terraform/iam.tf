resource "google_service_account" "cloud_run_sa" {
  account_id   = "restaurante-run-sa-tf"
  display_name = "Service Account Cloud Run Restaurante"

  depends_on = [google_project_service.iam_api]
}

resource "google_project_iam_member" "cloud_sql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}
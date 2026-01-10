terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

resource "google_compute_address" "static" {
  name   = "therapyai-static-ip"
  region = var.region
}

resource "google_compute_firewall" "allow_http" {
  name    = "therapyai-allow-http"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["80", "443"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["therapyai-server"]
}

# Firewall: Allow SSH
resource "google_compute_firewall" "allow_ssh" {
  name    = "therapyai-allow-ssh"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["therapyai-server"]
}

# The VM Instance
resource "google_compute_instance" "therapyai" {
  name         = "therapyai-server"
  machine_type = var.machine_type
  zone         = var.zone

  allow_stopping_for_update = true

  tags = ["therapyai-server"]

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-12"
      size  = 30
      type  = "pd-standard"
    }
  }

  network_interface {
    network = "default"
    access_config {
      nat_ip = google_compute_address.static.address
    }
  }

  metadata = {
    ssh-keys = <<EOT
${var.ssh_user}:${file(pathexpand("~/.ssh/id_rsa_therapyai_local.pub"))}
${var.ssh_user}:${file(pathexpand("~/.ssh/id_rsa_therapyai_github.pub"))}
EOT
  }

  # Startup script to install dependencies
  metadata_startup_script = file("${path.module}/startup.sh")
}
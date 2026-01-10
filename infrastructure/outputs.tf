output "instance_ip" {
  description = "Public IP address of the VM"
  value       = google_compute_address.static.address
}

output "ssh_command" {
  description = "SSH command to connect"
  value       = "ssh ${var.ssh_user}@${google_compute_address.static.address}"
}

output "http_url" {
  description = "HTTP URL"
  value       = "http://${google_compute_address.static.address}"
}
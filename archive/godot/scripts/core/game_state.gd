extends Node

signal helping_stars_changed(amount: int)
signal narration_requested(message: String)

const SAVE_PATH := "user://grand_tractor_auto_save.json"

var helping_stars: int = 0
var completed_job_ids: Array[String] = []
var unlocked_vehicle_ids: Array[String] = []
var harvested_crop_ids: Array[String] = []

func _ready() -> void:
	load_game()
	helping_stars_changed.emit(helping_stars)

func award_helping_stars(amount: int) -> void:
	if amount <= 0:
		return
	helping_stars += amount
	helping_stars_changed.emit(helping_stars)
	save_game()

func complete_job(job: Resource) -> void:
	if job == null or completed_job_ids.has(job.id):
		return
	completed_job_ids.append(job.id)
	award_helping_stars(job.helping_stars_reward)
	save_game()

func is_job_complete(job: Resource) -> bool:
	return job != null and completed_job_ids.has(job.id)

func remember_harvest(crop: Resource) -> void:
	if crop == null:
		return
	harvested_crop_ids.append(crop.id)
	save_game()

func request_narration(message: String) -> void:
	narration_requested.emit(message)

func save_game() -> void:
	var file := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if file == null:
		return
	var payload := {
		"helping_stars": helping_stars,
		"completed_job_ids": completed_job_ids,
		"unlocked_vehicle_ids": unlocked_vehicle_ids,
		"harvested_crop_ids": harvested_crop_ids,
	}
	file.store_string(JSON.stringify(payload, "  "))

func load_game() -> void:
	if not FileAccess.file_exists(SAVE_PATH):
		return
	var file := FileAccess.open(SAVE_PATH, FileAccess.READ)
	if file == null:
		return
	var parsed = JSON.parse_string(file.get_as_text())
	if typeof(parsed) != TYPE_DICTIONARY:
		return
	helping_stars = int(parsed.get("helping_stars", 0))
	completed_job_ids.assign(parsed.get("completed_job_ids", []))
	unlocked_vehicle_ids.assign(parsed.get("unlocked_vehicle_ids", []))
	harvested_crop_ids.assign(parsed.get("harvested_crop_ids", []))

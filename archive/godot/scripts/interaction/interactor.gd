extends Area3D
class_name Interactor

@export var interaction_radius: float = 2.25

var current: Node = null

func _ready() -> void:
	var shape := CollisionShape3D.new()
	var sphere := SphereShape3D.new()
	sphere.radius = interaction_radius
	shape.shape = sphere
	add_child(shape)
	monitoring = true
	monitorable = false

func _process(_delta: float) -> void:
	current = _find_best_interactable()

func try_interact() -> void:
	if current != null and current.has_method("interact"):
		current.interact(self)

func _find_best_interactable() -> Node:
	var best: Node = null
	var best_distance := INF
	for area in get_overlapping_areas():
		var candidate := area as Node
		if not _can_use(candidate):
			candidate = area.get_parent()
		if not _can_use(candidate):
			continue
		var distance := global_position.distance_squared_to((candidate as Node3D).global_position)
		if distance < best_distance:
			best = candidate
			best_distance = distance
	return best

func _can_use(candidate: Node) -> bool:
	if candidate == null or candidate == self:
		return false
	if not candidate is Node3D:
		return false
	if not candidate.has_method("can_interact") or not candidate.has_method("interact"):
		return false
	return candidate.can_interact(self)

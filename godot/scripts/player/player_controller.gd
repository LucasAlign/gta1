extends CharacterBody3D
class_name PlayerController

@export var walking_speed: float = 4.0
@export var interactor_path: NodePath

var vehicle: VehicleController = null

func _physics_process(_delta: float) -> void:
	var input := Input.get_vector("move_left", "move_right", "move_forward", "move_back")
	if vehicle != null:
		vehicle.set_input(input)
		if Input.is_action_just_pressed("interact"):
			vehicle.dismount()
			vehicle = null
		return
	velocity = Vector3(input.x, 0.0, input.y) * walking_speed
	move_and_slide()
	if velocity.length_squared() > 0.01:
		look_at(global_position + velocity, Vector3.UP)
	if Input.is_action_just_pressed("interact"):
		_request_interact()

func _request_interact() -> void:
	var interactor := _interactor()
	if interactor == null:
		return
	interactor.try_interact()
	if interactor.current is VehicleController:
		vehicle = interactor.current

func _interactor() -> Interactor:
	if interactor_path != NodePath("") and has_node(interactor_path):
		return get_node(interactor_path) as Interactor
	return null

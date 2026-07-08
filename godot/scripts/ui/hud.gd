extends CanvasLayer
class_name Hud

@onready var stars_label: Label = %StarsLabel
@onready var narration_label: Label = %NarrationLabel
@onready var interaction_label: Label = %InteractionLabel
@export var interactor_path: NodePath

func _ready() -> void:
	GameState.helping_stars_changed.connect(_on_helping_stars_changed)
	GameState.narration_requested.connect(_on_narration_requested)
	_on_helping_stars_changed(GameState.helping_stars)
	_on_narration_requested("Let's help the garden grow.")

func _process(_delta: float) -> void:
	var interactor := get_node_or_null(interactor_path) as Interactor
	if interactor != null and interactor.current != null and interactor.current.has_method("get_interaction_label"):
		interaction_label.text = "Space: %s" % interactor.current.get_interaction_label()
	else:
		interaction_label.text = "Move: WASD   Interact: Space"

func _on_helping_stars_changed(amount: int) -> void:
	stars_label.text = "Helping Stars: %d" % amount

func _on_narration_requested(message: String) -> void:
	narration_label.text = message

<?php

class Reponse {
    public $id;
    public $question_id;
    public $intitule;
    public $type;
    public $is_correct;

    public function __construct($id = null, $question_id = null, $intitule = null, $type = null, $is_correct = null) {
        $this->id = $id;
        $this->question_id = $question_id;
        $this->intitule = $intitule;
        $this->type = $type;
        $this->is_correct = $is_correct;
    }

    public function toArray() {
        return [
            'id' => $this->id,
            'question_id' => $this->question_id,
            'intitule' => $this->intitule,
            'type' => $this->type,
            'is_correct' => (bool) $this->is_correct
        ];
    }
}
?>

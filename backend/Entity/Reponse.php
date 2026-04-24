<?php

class Reponse {
    public $id;
    public $ordre;
    public $intitule;
    public $type;
    public $is_correct;

    public function __construct($id = null, $ordre = null, $intitule = null, $type = null, $is_correct = null) {
        $this->id = $id;
        $this->ordre = $ordre;
        $this->intitule = $intitule;
        $this->type = $type;
        $this->is_correct = $is_correct;
    }

    public function toArray() {
        return [
            'id' => $this->id,
            'ordre' => $this->ordre,
            'intitule' => $this->intitule,
            'type' => $this->type,
            'is_correct' => (bool) $this->is_correct
        ];
    }
}
?>

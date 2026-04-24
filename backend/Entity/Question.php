<?php

class Question {
    public $id;
    public $intitule;
    public $indice;
    public $type;

    public function __construct($id = null, $intitule = null, $indice = null, $type = null) {
        $this->id = $id;
        $this->intitule = $intitule;
        $this->indice = $indice;
        $this->type = $type;
    }

    public function toArray() {
        return [
            'id' => $this->id,
            'intitule' => $this->intitule,
            'indice' => $this->indice,
            'type' => $this->type
        ];
    }
}
?>

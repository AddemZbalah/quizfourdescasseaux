<?php

class Admin {
    public $id;
    public $username;
    public $password;

    public function __construct($id = null, $username = null, $password = null) {
        $this->id = $id;
        $this->username = $username;
        $this->password = $password;
    }
}
?>
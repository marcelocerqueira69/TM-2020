function atualizaTexto() {
    var text = document.getElementById("inputTexto").value;
    if(!text.length){
        alert("Input vazio, say something");
    }
    document.getElementById("texto").innerHTML = text;
}
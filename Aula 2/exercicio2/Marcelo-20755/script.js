var numeros = [];

function adicionarNumero(){
    numeros.push(document.getElementById("numero").value);
    document.getElementById("numeros").innerHTML = numeros;
    console.log(numeros);
}

function maior(){
    var i;
    var maior;
    if(numeros.length < 5){
        alert("Tem de adicionar pelo menos 5 números");
    }
    maior = Math.max.apply(Math, numeros);
    document.getElementById("maior").innerHTML = maior;

}

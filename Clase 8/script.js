const filas = document.querySelector("tbody");
var total= 0;
function carita(nota) {
    if (nota > 5.9) {
        return "😃";
    } else if (nota == 5.9) {
        return "😥";
    } else {
        return "😭";
    }
}
async function notas() {
    let consulta = await fetch("https://raw.githubusercontent.com/profesorfaco/opr/refs/heads/main/clase-08/notas.json");
    let data = await consulta.json();
    console.log(data);
    data.forEach((d)=>{
        filas.innerHTML += `<tr><td>${d.nombre}</td><td>${d.nota}</td><td>${carita(d.nota)}</td></tr>`;
        total += d.nota;
    });
    document.getElementById("promedio").innerHTML = (total/12).toFixed(1);
}
notas().catch((error) => {
    console.error("Error al cargar los datos:", error);
});
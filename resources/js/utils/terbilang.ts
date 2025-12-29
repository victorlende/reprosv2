export function terbilang(angka: number): string {
    const bilne = [
        "",
        "Satu",
        "Dua",
        "Tiga",
        "Empat",
        "Lima",
        "Enam",
        "Tujuh",
        "Delapan",
        "Sembilan",
        "Sepuluh",
        "Sebelas",
    ];
    let terbilang = "";

    if (angka < 12) {
        terbilang = " " + bilne[Math.floor(angka)];
    } else if (angka < 20) {
        terbilang = terbilangId(angka - 10) + " Belas";
    } else if (angka < 100) {
        terbilang =
            terbilangId(Math.floor(angka / 10)) +
            " Puluh" +
            terbilangId(angka % 10);
    } else if (angka < 200) {
        terbilang = " Seratus" + terbilangId(angka - 100);
    } else if (angka < 1000) {
        terbilang =
            terbilangId(Math.floor(angka / 100)) +
            " Ratus" +
            terbilangId(angka % 100);
    } else if (angka < 2000) {
        terbilang = " Seribu" + terbilangId(angka - 1000);
    } else if (angka < 1000000) {
        terbilang =
            terbilangId(Math.floor(angka / 1000)) +
            " Ribu" +
            terbilangId(angka % 1000);
    } else if (angka < 1000000000) {
        terbilang =
            terbilangId(Math.floor(angka / 1000000)) +
            " Juta" +
            terbilangId(angka % 1000000);
    } else if (angka < 1000000000000) {
        terbilang =
            terbilangId(Math.floor(angka / 1000000000)) +
            " Milyar" +
            terbilangId(angka % 1000000000);
    } else if (angka < 1000000000000000) {
        terbilang =
            terbilangId(Math.floor(angka / 1000000000000)) +
            " Trilyun" +
            terbilangId(angka % 1000000000000);
    }

    return terbilang;
}

function terbilangId(angka: number): string {
    const bilne = [
        "",
        "Satu",
        "Dua",
        "Tiga",
        "Empat",
        "Lima",
        "Enam",
        "Tujuh",
        "Delapan",
        "Sembilan",
        "Sepuluh",
        "Sebelas",
    ];
    let terbilang = "";

    if (angka < 12) {
        terbilang = " " + bilne[Math.floor(angka)];
    } else if (angka < 20) {
        terbilang = terbilangId(angka - 10) + " Belas";
    } else if (angka < 100) {
        terbilang =
            terbilangId(Math.floor(angka / 10)) +
            " Puluh" +
            terbilangId(angka % 10);
    } else if (angka < 200) {
        terbilang = " Seratus" + terbilangId(angka - 100);
    } else if (angka < 1000) {
        terbilang =
            terbilangId(Math.floor(angka / 100)) +
            " Ratus" +
            terbilangId(angka % 100);
    } else if (angka < 2000) {
        terbilang = " Seribu" + terbilangId(angka - 1000);
    } else if (angka < 1000000) {
        terbilang =
            terbilangId(Math.floor(angka / 1000)) +
            " Ribu" +
            terbilangId(angka % 1000);
    } else if (angka < 1000000000) {
        terbilang =
            terbilangId(Math.floor(angka / 1000000)) +
            " Juta" +
            terbilangId(angka % 1000000);
    } else if (angka < 1000000000000) {
        terbilang =
            terbilangId(Math.floor(angka / 1000000000)) +
            " Milyar" +
            terbilangId(angka % 1000000000);
    } else if (angka < 1000000000000000) {
        terbilang =
            terbilangId(Math.floor(angka / 1000000000000)) +
            " Trilyun" +
            terbilangId(angka % 1000000000000);
    }

    return terbilang;
}

export function formatTerbilang(angka: number): string {
    if (angka === 0) return "Nol Rupiah";
    const result = terbilang(Math.abs(angka));
    return (result + " Rupiah").trim();
}

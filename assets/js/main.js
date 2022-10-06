/* console.log("ucitan main"); */

var slajderPozovi = 0;
localStorage.setItem("displaySizeClick", 0);
$(document).ready(() => {
    /* console.log("Lepo povezan jquery"); */

    //Dinamicki ispis NavBara
    $.ajax({
        url: "assets/data/navItems.json",
        dataType: "json",
        method: "get",
        success: function (result) {
            ispisiNav(result);
        },
        error: function (xhr) {
            console.log("Doslo je do greske" + xhr.message);
        }
    });

    function ispisiNav(navItems) {
        let html = "<ul>";

        for (var item of navItems) {
            if (window.location.pathname.indexOf(item.href) != -1) {
                html += `<a href="${ispisPutanje(item.href)}"><li data-id="${item.id}">${item.name}</li></a>`;
            } else {
                html += `<a href="${item.href}"><li data-id="${item.id}">${item.name}</li></a>`;
            }
        }
        html += "</ul>";
        $("#navMenu").html($("#navMenu").html() + html);
    }

    function ispisPutanje(href) {
        return (`#${href.slice(0, -5)}Main`);
    }

    //Dinamicki ispis Carousela
    $.ajax({
        url: "assets/data/carouselPics.json",
        dataType: "json",
        method: "get",
        success: function (result) {
            ispisiCarousel(result);
        },
        error: function (xhr) {
            console.log("Doslo je do greske" + xhr.responseText);
        }
    });

    function ispisiCarousel(slike) {
        tekstImg = "";
        tekstIndikatori = "";
        slike.forEach((slika, i) => {
            if (i == 0) {
                tekstImg +=
                    `
            <div class="item active">
                <img src="assets/img/${slika.src}" alt="${slika.alt}">
             </div>
            `;
                tekstIndikatori += `<li data-target="#myCarousel" data-slide-to="${i}" class="active"></li>`;
            } else {
                tekstImg +=
                    `
            <div class="item">
                <img src="assets/img/${slika.src}" alt="${slika.alt}">
             </div>
            `;
                tekstIndikatori += `<li data-target="#myCarousel" data-slide-to="${i}"></li>`;
            }
        })

        $(".carousel-indicators").html(tekstIndikatori);
        $(".carousel-inner").html(tekstImg);
    }

    //Dinamicki ispis futer elemenata:
    $.ajax({
        url: "assets/data/footerPicElements.json",
        dataType: "json",
        method: "get",
        success: function (result) {
            ispisiFooterFaFa(result);
        },
        error: function (xhr) {
            console.log(xhr.responseText);
        }
    })

    function ispisiFooterFaFa(fas) {
        tekst = "";
        for (let fa of fas) {
            tekst += `<a href="${fa.src}"><li> <i class="${fa.fa_fa}"></i> </li></a>`
        }
        $("#icons ul").html(tekst);
    }

    //Dohvatanje proizvoda i smestanje u local storage
    function dohvati(url, method, promenljiva) {
        $.ajax({
            url: "assets/data/" + url,
            dataType: "json",
            method: method,
            success: function (result) {
                localStorage.setItem(promenljiva, JSON.stringify(result));
            },
            error: function (xhr) {
                console.log(xhr.responseText);
            }
        });
    }

    dohvati("products.json", "get", "proizvodi");
    dohvati("categories.json", "get", "categories");
    dohvati("brands.json", "get", "brands")



});//Kraj ucitavanja

if (window.location.pathname == "/shop.html") {
    ispisProizvoda(localStorage.getItem("proizvodi"));
    ispisKategorijaBrendova(localStorage.getItem("categories"), "#filterCategories");
    ispisKategorijaBrendova(localStorage.getItem("brands"), "#filterBrands");

    /*=====================================FILTERI================================*/
    if ($("#slider-range")[0]) {
        $(function () {
            $("#slider-range").slider({
                range: true,
                min: 0,
                max: 500,
                values: [0, 500],
                step: 5,
                change: function () { ispisProizvoda() }, //OVDE SE RADI ISPIS
                slide: function (event, ui) {
                    $("#amount").val("$" + ui.values[0] + " - $" + ui.values[1]);
                }
            });
            $("#amount").val("$" + $("#slider-range").slider("values", 0) +
                " - $" + $("#slider-range").slider("values", 1));
        });
    }

    //Da li je element u nizu
    function inArray(needle, haystack) {
        var length = haystack.length;
        for (var i = 0; i < length; i++) {
            if (haystack[i] == needle) return true;
        }
        return false;
    }

    //Filter slajder za cenu
    function filterSlajder(products) { //ISPIS se radi na dnu u eventu change
        var sliderValues = new Array($("#slider-range").slider("values", 0), $("#slider-range").slider("values", 1));
        //console.log(sliderValues);//[a, b] int[]
        let min = sliderValues[0];
        let max = sliderValues[1];
        return products.filter(pr => pr.cena.nova > min && pr.cena.nova < max);
    }

    //Sort
    function sort(products) {
        let tip;
        for (let radio of $(".filterProducts input[type='radio']")) {
            if (radio.checked) {
                tip = radio.value;
            }
        }
        if (tip == "priceAsc") {
            products.sort((a, b) => a.cena.nova - b.cena.nova);
        } else if (tip == "priceDesc") {
            products.sort((a, b) => b.cena.nova - a.cena.nova);
        } else if (tip == "brandAsc") {
            products.sort((a, b) => brend(a.brend) > brend(b.brend) ? 1 : -1);
        } else if (tip == "brandDesc") {
            products.sort((a, b) => brend(a.brend) > brend(b.brend) ? -1 : 1);
        } else if (tip == "ratingAsc") {
            products.sort((a, b) => a.rating - b.rating);
        } else if (tip == "ratingDesc") {
            products.sort((a, b) => b.rating - a.rating);
        }

        return products;
    }

    //Search
    function search(products) {
        let termin = $("#search #term").val();
        if (termin) {
            return products.filter(pr => {
                if (
                    (pr.naziv.toLowerCase().indexOf(termin.toLowerCase()) != -1) ||
                    (kategorija(pr.kategorija).toLowerCase().indexOf(termin.toLowerCase()) != -1) ||
                    (brend(pr.brend).toLowerCase().indexOf(termin.toLowerCase()) != -1)
                ) return true; else return false;
            }
            )
        } else return products;
    }

    //Categories
    function filterCategory(products) {
        let cekirani = new Array();
        for (let checkbox of $("#filterCategories input[type='checkbox']")) {
            if (checkbox.checked) {
                cekirani.push(checkbox.value);
            }
        }

        if (cekirani.length != 0) {
            return products.filter(pr => inArray(kategorija(pr.kategorija), cekirani));
        } else return products;
    }

    //Brands
    function filterBrands(products) {
        let cekirani = new Array();
        for (let checkbox of $("#filterBrands input[type='checkbox']")) {
            if (checkbox.checked) {
                cekirani.push(checkbox.value);
            }
        }


        if (cekirani.length != 0) {
            return products.filter(pr => inArray(brend(pr.brend), cekirani));
        } else return products;
    }

    //Discount
    function discount(products) {
        let cekiran = $("#priceRange input[type='checkbox']")[0].checked;

        if (cekiran) {
            return products.filter((pr) => pr.cena.stara != "/");
        } else return products;

    }

    //Reset
    $("#resetFilter").click(() => {

        //Reset slajdera
        //console.log("usao");
        $(function () {
            $("#slider-range").slider({
                range: true,
                min: 0,
                max: 500,
                values: [0, 500],
                step: 5,
                change: function () { ispisProizvoda() }, //OVDE SE RADI ISPIS
                slide: function (event, ui) {
                    $("#amount").val("$" + ui.values[0] + " - $" + ui.values[1]);
                }
            });
            $("#amount").val("$" + $("#slider-range").slider("values", 0) +
                " - $" + $("#slider-range").slider("values", 1));
        });

        //Reset diskaunta
        $("#priceRange input[type='checkbox']")[0].checked = false;

        //Reset sorta
        $(".filterProducts input[value='default']")[0].checked = true;

        //Reset pretrage
        $("#search #term")[0].value = "";

        //Reset kategorija
        for (let checkbox of $("#filterCategories input[type='checkbox']")) {
            checkbox.checked = false;
        }

        //Reset brendova
        for (let checkbox of $("#filterBrands input[type='checkbox']")) {
            checkbox.checked = false;
        }

    })

    $("#priceRange input[type='checkbox']").change(ispisProizvoda);

    $("#filterBrands input[type='checkbox']").change(ispisProizvoda);

    $("#filterCategories input[type='checkbox']").change(ispisProizvoda);

    $("#search #term").keyup(ispisProizvoda);

    $(".filterProducts input[type='radio']").change(ispisProizvoda);

    /*=====================================FILTERI================================*/

    ispisProizvoda;
    //Koji prikaz korisnik zeli:
    $("#prSize li").click((el) => {

        localStorage.setItem("displaySizeClick", 1);
        if (el.currentTarget.getAttribute("data-Id") == 2) {
            localStorage.setItem("prikaz", 1);
        } else if (el.currentTarget.getAttribute("data-Id") == 3)
            localStorage.setItem("prikaz", 0);
        ispisProizvoda();

        //dodavanje event listenera na novi ispis
        $(".productButton").click((el) => {
            ispisiCartShop(el.currentTarget.getAttribute("class"), el.currentTarget.getAttribute("data-id"));
            $("#shoppingPopUp").fadeIn("slow");
            setTimeout(function () { $("#shoppingPopUp").fadeOut("slow") }, 3000);
        });
    }
    );

    //ispis filterKategorija i filterBrendova:
    function ispisKategorijaBrendova(niz, id) {
        niz = JSON.parse(niz);
        niz.sort((a, b) => a.naziv > b.naziv ? 1 : -1);
        let tekst = id.indexOf("Brands") == -1 ? `<div class="row"><h2>Categories:</h2></div>` : `<div class="row"><h2>Brands:</h2></div>`;
        for (let stavka of niz) {
            tekst += `
            <div class="inputHolder">
                <div class="col-sm-10"><label for="${stavka.naziv}">${stavka.naziv}</label></div>
                <div class="col-sm-2"><input type="checkbox" id="${stavka.naziv}" name="${stavka.naziv}" value="${stavka.naziv}"/></div>
            </div>
        `
        }
        $(id).html(tekst);
    }

    //Ispis proizvoda unutar shop-a:


    function ispisProizvoda() {

        let tekst = ``;
        if (localStorage.getItem("proizvodi") != null) {
            let products = JSON.parse(localStorage.getItem("proizvodi"));

            products = sort(products);
            products = discount(products);
            if (slajderPozovi != 0) {
                products = filterSlajder(products);

            } else slajderPozovi += 1;
            products = search(products);
            products = filterBrands(products);
            products = filterCategory(products);
            //console.log("Ispis.");

            if (products.length != 0) {

                var i = 0;
                var j = 0;

                if (localStorage.getItem("displaySizeClick") != 1) {
                    if (products.length < 10) localStorage.setItem("prikaz", 1);
                    if (products.length > 30) localStorage.setItem("prikaz", 0);
                } else {
                    localStorage.setItem("displaySizeClick", 0)
                }

                for (let product of products) {
                    if ((localStorage.getItem("prikaz") == null) || (localStorage.getItem("prikaz") == 0)) {
                        if (j == 0) { tekst += "<div class='row'>" }
                        tekst += `
                    <div class="col-sm-3">
                    <div class="productInfo">
                    <img src="${srcSlike(product)}" alt="${product.img.alt}"/>
                    <p class="zvezde">${ispisiZvezde(product.rating)}</p>
                    <h3>${brend(product.brend)}</h3>
                    <h4>${product.naziv}</h4>
                    <h6>${kategorija(product.kategorija)}</h6>
                    <p>${product.cena.nova}$</p>
                    <s>${product.cena.stara != "/" ? product.cena.stara : ""}</s>
                    </div>
                    <input type="button" class="productButton" data-id="${product.id}" name="productButton" value="Buy this item"/>
                    </div>
                `;

                        i += 1;
                        j += 1;

                        if (j == 3) {
                            tekst += "</div>";
                            j = 0;
                        }
                    } else {
                        tekst += `
                <div class='row'>
                    <div class="col-sm-6">
                        <img src="${srcSlike(product)}" alt="${product.img.alt}"/>
                    </div>
                    <div class="col-sm-6">  
                        <p class="zvezde">${ispisiZvezde(product.rating)}</p>
                        <h3>${brend(product.brend)}</h3>
                        <h4>${product.naziv}</h4>
                        <h6>${kategorija(product.kategorija)}</h6>
                        <p>${product.cena.nova}$</p>
                        <s>${product.cena.stara != "/" ? product.cena.stara : ""}</s>
                        <input type="button" class="productButton" data-id="${product.id}" name="productButton" value="Buy this item"/>
                    </div>
                </div>
                `
                    }
                }
            } else {
                tekst += `<div class="row alert-danger">There are currently no products that fit your criteria.</div>`
            }
        } else {
            tekst += `<div class="row alert-danger">There are currently no products that fit your criteria.</div>`
        }
        $("#products").html(tekst);

        uskladisti();
        $(".productButton").click((el) => {
            ispisiCartShop(el.currentTarget.getAttribute("class"), el.currentTarget.getAttribute("data-id"));
            $("#shoppingPopUp").fadeIn("slow");
            setTimeout(function () { $("#shoppingPopUp").fadeOut("slow") }, 3000);
        });

    }

    function ispisiZvezde(star) {
        let tekst = "";
        for (let i = 0; i < star; i++) {
            tekst += `<i class="fa fa-star" aria-hidden="true"></i>`
        }
        return tekst;
    }

    function srcSlike(product) {
        let src = `assets/img/Products/${product.pol == "M" ? "Man" : "Woman"}/${kategorija(product.kategorija)}/${product.img.src}`;
        return src;
    }

    function kategorija(kategorija) {
        let arrCat = JSON.parse(localStorage.getItem("categories"));

        for (let cat of arrCat) {
            if (cat.id == kategorija) return cat.naziv;
        }
    }

    function brend(brand) {
        let arrBrands = JSON.parse(localStorage.getItem("brands"));

        for (let br of arrBrands) {
            if (br.id == brand) return br.naziv;
        }
    }


    //Slider za cenu

    

    //menjanje fleksa inputima za filter u zavisnosti od rezolucije:
    window.addEventListener("resize", function () {
        if (window.location.pathname == "/shop.html") {
            let duzinaEkrana = document.getElementsByTagName("nav")[0].clientWidth;
            if (document.getElementById("filtersAside").clientWidth > duzinaEkrana / 2) $("#filtersAside .inputHolder").css('justify-content', 'space-between'); else $("#filtersAside .inputHolder").css('justify-content', 'flex-end');
        }
    });

    //Kupovina proizvoda: cuvanje u local storage za dodavanje

    function uskladisti() {
        $(".productButton").click((el) => {
            let id = { "id": parseInt(el.currentTarget.getAttribute("data-id")), "kolicina": 1 };

            if (!localStorage.getItem("korpa")) {
                //console.log("usao u praznu korpu");
                let korpa = [];
                korpa.push(id);
                localStorage.setItem("korpa", JSON.stringify(korpa));
            } else {
                let korpa = JSON.parse(localStorage.getItem("korpa"));
                let i = 1;
                for (let proizvod of korpa) {
                    if (proizvod.id == id.id) {
                        proizvod.kolicina = proizvod.kolicina + 1;
                        localStorage.setItem("korpa", JSON.stringify(korpa));
                        break;
                    } else if (i == korpa.length) {
                        korpa.push(id);
                        localStorage.setItem("korpa", JSON.stringify(korpa));
                        break;
                    }
                    i++;
                }
            }
        });
    }
    //Kupovina proizvoda: ispis korpe
    if (localStorage.getItem("korpa") != "" && localStorage.getItem("korpa")) {
        ispisiCartShop("productButton");
    } else (ispisiCartShop("prazno"));




    //Kupovina proizvoda: ispis unutar carta na shopu:
    $(".removeProduct").click((el) => {
        ispisiCartShop(el.currentTarget.getAttribute("class"), el.currentTarget.getAttribute("data-id"));

    });

    $(".productButton").click((el) => {
        ispisiCartShop(el.currentTarget.getAttribute("class"), el.currentTarget.getAttribute("data-id"));
        $("#shoppingPopUp").fadeIn("slow");
        setTimeout(function () { $("#shoppingPopUp").fadeOut("slow") }, 3000);
    });



    function ispisiCartShop(klasa, id) {
        //console.log(klasa);
        let tekst = `<div class="thumbProduct"><h2>Your Cart</h2></div>`;
        let total = 0;
        if (klasa == "productButton") {
            //console.log("usao u add product");
            let proizvodiKorpa = JSON.parse(localStorage.getItem("korpa"));
            let proizvodiSvi = JSON.parse(localStorage.getItem("proizvodi"));

            for (proizvodKorpa of proizvodiKorpa) {
                for (proizvodSvi of proizvodiSvi) {
                    if (proizvodKorpa.id == proizvodSvi.id) {
                        tekst += `
                    <div class="thumbProduct">
                        <img src="${srcSlike(proizvodSvi)}" alt="${proizvodSvi.img.alt}"/>
                        <p>${proizvodSvi.cena.nova}$</p>
                        <p>U korpi: ${proizvodKorpa.kolicina}</p>
                        <input type="button" data-Id="${proizvodSvi.id}" value="Remove" name="remove" class="removeProduct"/>
                        <p>${proizvodSvi.naziv}</p>
                    </div>
                    `;
                        total += parseInt(proizvodSvi.cena.nova) * proizvodKorpa.kolicina;
                    }
                }
            }
        } else if (klasa == "removeProduct") {
            //console.log("usao u remove product");
            //console.log(id);
            let korpa = JSON.parse(localStorage.getItem("korpa"));
            for (let proizvod of korpa) {
                if (proizvod.id == id) {
                    proizvod.kolicina -= 1;
                    korpa = korpa.filter(pr => pr.kolicina != 0);
                    localStorage.setItem("korpa", JSON.stringify(korpa));
                    break;
                }
            }

            let proizvodiKorpa = JSON.parse(localStorage.getItem("korpa"));
            let proizvodiSvi = JSON.parse(localStorage.getItem("proizvodi"));

            for (proizvodKorpa of proizvodiKorpa) {
                for (proizvodSvi of proizvodiSvi) {
                    if (proizvodKorpa.id == proizvodSvi.id) {
                        tekst += `
                    <div class="thumbProduct">
                        <img src="${srcSlike(proizvodSvi)}" alt="${proizvodSvi.img.alt}"/>
                        <p>${proizvodSvi.cena.nova}$</p>
                        <p>U korpi: ${proizvodKorpa.kolicina}</p>
                        <input type="button" data-Id="${proizvodSvi.id}" value="Remove" name="remove" class="removeProduct"/>
                        <p>${proizvodSvi.naziv}</p>
                    </div>
                    `;
                        total += parseInt(proizvodSvi.cena.nova) * proizvodKorpa.kolicina;
                    }
                }
            }
        } else if (klasa == "prazno") { tekst += `<div class="thumbProduct"><p>Fill it to the Brim !!!<p></div>` }
        if (localStorage.getItem("korpa") == "[]") { localStorage.removeItem("korpa"); tekst += `<div class="thumbProduct"><p>Fill it to the Brim !!!<p></div>`; } else if (localStorage.getItem("korpa")) {
            tekst += `<div class="thumbProduct"><h2>Total: ${total}$</h2></div>`;
        }

        $("#cartAside").html(tekst);
        $(".removeProduct").click((el) => {
            ispisiCartShop(el.currentTarget.getAttribute("class"), el.currentTarget.getAttribute("data-id"));
        });
        //console.log("gotov ispis carta");
    }
}
//NavBar se pokazuje samo kad se skrola nagore ili kada je mis blizu vrha strane:

window.addEventListener("scroll", logScrollDirection);
window.addEventListener("mousemove", logMouseMove);


function logMouseMove(event) {
    var e = e || window.event;
    mousePos = { x: e.clientX, y: e.clientY };
    if (mousePos.y < 130) {
        nav.classList.remove("show")
    }
}

let nav = document.getElementsByTagName("nav")[0];
function logScrollDirection() {
    var previous = window.scrollY;
    window.addEventListener('scroll', function () {
        window.scrollY > previous ? nav.classList.add("show") : nav.classList.remove("show");
        previous = window.scrollY;
    });
}

//Automatsko postavljanje margine header taga u odnosu na visinu navBara da bi se prikazao ceo content, kao i pozicioniranje captiona unutar carousela. Ovo se odnosi samo na index stranicu.

$(document).ready(() => {
    if (window.location.pathname == "/shop.html") {
            let duzinaEkrana = document.getElementsByTagName("nav")[0].clientWidth;
            if (document.getElementById("filtersAside").clientWidth > duzinaEkrana / 2) $("#filtersAside .inputHolder").css('justify-content', 'space-between'); else $("#filtersAside .inputHolder").css('justify-content', 'flex-end');
        }
    if (window.location.pathname == "/shop.html") { $("#berixLogo").css("margin-top", "30px"); $("#prSize ul").css("width", "80%"); }
    var visinaNav = document.getElementsByTagName("nav")[0].clientHeight;
    var duzinaNav = document.getElementsByTagName("nav")[0].clientWidth;
    if (duzinaNav > 700) {
        $('header').css('margin-top', `${visinaNav + 5}px`);
    } else {
        $('header').css('margin-top', `${visinaNav}px`);
    }

    var duzinaCarousel = document.getElementById("carousel").clientWidth;
    let duzinaCaption = document.getElementById("carouselCaption").clientWidth;
    marginaDuzine = (duzinaCarousel - duzinaCaption) / 2;
    $('#carouselCaption').css('margin-left', `${marginaDuzine}px`);

});

window.addEventListener('resize', function () {
    $("#berixLogo").css("margin-top", "30px");
    var visinaNav = document.getElementsByTagName("nav")[0].clientHeight;
    var duzinaNav = document.getElementsByTagName("nav")[0].clientWidth;
    if (duzinaNav > 700) {
        $('header').css('margin-top', `${visinaNav + 5}px`);
    } else {
        $('header').css('margin-top', `${visinaNav}px`);
    }

    var duzinaCarousel = document.getElementById("carousel").clientWidth;
    let duzinaCaption = document.getElementById("carouselCaption").clientWidth;
    marginaDuzine = (duzinaCarousel - duzinaCaption) / 2;
    $('#carouselCaption').css('margin-left', `${marginaDuzine}px`);
});

//Otvaranje responziv menija na klik:

$('#navMenu').click(() => {
    if (document.getElementsByTagName("nav")[0].clientWidth < 1000) {
        document.querySelector("ul").classList.toggle('show');
    }
})

//Go to top dugme
$('#back-to-top').fadeOut();

$(window).scroll(function () {
    if ($(this).scrollTop() > 500) {
        $('#back-to-top').fadeIn("slow");
    } else {
        $('#back-to-top').fadeOut("slow");
    }
});

//Ispitivanje forme za kontakt i slanje podataka.
//console.log("Usao");
var reIme = /^[A-Z][a-z]{1,11}(\s[A-Z][a-z]{1,11}){1,2}/;
var reBroj = /(^\+[\d]{10,13})|(^\+[\d]{3,5}(\s\d{2,4}){1,4})/;
var reMail = /^\S{1,15}@\S{1,15}$/ //dozvoljavam da unesu bez .com jer moze da bude .yahoo itd. Za detaljnije mejlove bih koristio slozenije regexpove.

var ime = 0;
var telefon = 0;
var mail = 0;

form.name.addEventListener("blur", function () {
    if (form.name.value.match(reIme)) {
        inputName.textContent = "  Name Format is correct.";
        setTimeout(() => inputName.textContent = "", 5000);
        ime = 0;
    } else if (!form.name.value) {
        inputName.textContent = "  Field is empty.";
        setTimeout(() => inputName.textContent = "", 10000);
        ime = 0;
    } else {
        inputName.textContent = "  Word begins with a capital letter followed by a non capital.";
        setTimeout(() => inputName.textContent = "", 10000);
        ime = 1;
    }
});

form.phone.addEventListener("blur", function () {
    if (form.phone.value.match(reBroj)) {
        inputPhone.textContent = "  Phone Format is correct.";
        setTimeout(() => inputPhone.textContent = "", 5000);
        telefon = 0;
    } else if (!form.phone.value) {
        inputPhone.textContent = "  Field is empty.";
        setTimeout(() => inputPhone.textContent = "", 10000);
        telefon = 0;
    } else {
        inputPhone.textContent = "  Wrong phone format. Example: +381648586055";
        setTimeout(() => inputPhone.textContent = "", 10000);
        telefon = 1;
    }
});

form.emailaddress.addEventListener("blur", function () {
    if (form.emailaddress.value.match(reMail)) {
        inputMail.textContent = "  E-Mail format is correct. You will be asked to verify it.";
        setTimeout(() => inputMail.textContent = "", 5000);
        mail = 0;
    } else if (!form.emailaddress.value) {
        inputMail.textContent = "  Field is empty.";
        setTimeout(() => inputMail.textContent = "", 10000);
        mail = 0;
    } else {
        inputMail.textContent = "  Write the e-mail correctly. Example: name@yahoo.com";
        setTimeout(() => inputMail.textContent = "", 10000);
        mail = 1;
    }
});


form.message.addEventListener("blur", function () {
    if (!(inputText.getAttribute("class") == "white")) {
        if (form.message.value == "") {
            inputText.textContent = "  Write something if you want to send a message.";
            setTimeout(() => inputText.textContent = "*Field Required", 10000);
            inputText.setAttribute("class", "white");
            setTimeout(() => inputText.setAttribute("class", ""), 10000);
        }
    }
});

//Funkcija za resetovanje elemenata forme prilikom slanja podataka

function resetuj() {
    var nizReset = new Array();
    nizReset = $('input');
    nizReset.push($('#message')[0]);
    //console.log(nizReset);
    for (i = 0; i < nizReset.length; i++) {
        if (nizReset[i].id != "button") {
            nizReset[i].value = "";
            //console.log(nizReset[i].id);
        }
    }
}

//Sabmitovanje podataka iz futera
buttonFooter.addEventListener("click", function () {
    if ((form.message.value != "") && !((ime) || (telefon) || (mail))) {
        window.alert("You have successfully sent a message! Thank you for your commitment.");
    } else {
        window.alert("You did not fulfill all the conditions! Please enter the information correctly, or don't fill it at all if you want to keep your privacy.");
    }
    resetuj();
});

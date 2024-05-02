//Number of fruits
const FRUIT_COUNT = 10;

const scoreContainer = document.getElementById("score-container");
const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("start-button");
const coverScreen = document.querySelector(".cover-screen");
const result = document.getElementById("result");
const overText = document.getElementById("over-text");
const title=document.getElementById("title");

let fruits = [];
let points = 0;
const fruitsList = ["apple","grapes","banana","fotom"];

//Events object
let events = {
  mouse: {
    down: "mousedown",//mousedown" ve "touchstart js'de gömülü gelen terimlerdir, tıklama/dokunma olayalrını temsil ederler
  },
  touch: {//mouse ve touch anahtarları, kullanıcı etkileşimlerini temsil eden fare ve dokunmatik olaylar için ayrı alt nesnelerdir. Her bir alt nesne, belirli bir etkileşim türünü (down) belirleyen bir anahtar ile ilişkilendirilmiştir."mousedown" ve "touchstart" gibi dize değerleri, ilgili etkileşim türlerini temsil eden olay adlarıdır.
    down: "touchstart",
  },
}; //yani eger deviceType mouse ise down'ı yani tıklama şekli mousedown[js gömülü eventi], deviceType touch ise onun tıklama şekli yani down'ı [biz tanımladık] touchstart'tir. [js gömülü eventi]

let deviceType="";

let interval, randomCreationTime;
const isTouchDevice = () => {//cihaz dokunmatik mi değil mi kontrol ediyor
  try {
    document.createEvent("TouchEvent"); //Touch eventini mouse click'i ile yapıyorsa touch device degildir false döndürür
    deviceType = "touch";//eventi dokunarak yapıyorsa deviyeType=touch olsun ve true döndür
    return true; //Ayrıca TouchEvent bir js nesnesidir, touchstart touchend gibi propertyler bulundurur
  } catch (e) {
    deviceType = "mouse";
    return false;
  }
};

//Random number generator
const generateRandomNumber = (min, max) => //rastgele sayı üretir
  Math.floor(Math.random() * (max - min + 1) + min); //Math.random() fonksiyonu 0 ile 1 arasinda bir ondalık sayı döndürür, biz bunu max-min+1 ile çarparsak bu sayı bizim istedigimiz aralıkta olmus olur fakat hala ondalik haldedir. floor fonksiyonu ile de en yakin tamsayıya yuvarlarız, böylece istedigimiz aralıktakı random tamsayiyi tayin etmis oluruz

//Fruit
function Fruit(image, x, y, width) {
  this.image = new Image(); //Image bir js gömülü nesnesidir, resimleri yönetmeye yarayan birden fazla alt property içerir
  this.image.src = image;// gönderilen image'i alinan image'in adresine esitliyor
  this.x = x; //gönderilen koordinatlari constructorimizin x ve y koordinatlarina esitliyor, bunlar meyvelerin koordinatlari
  this.y = y;
  this.speed = generateRandomNumber(3, 13);// meyvenin hizi rastgele belirleniyor
  this.width = width;
  this.clicked = false; // complete ve clicked js'de gömülü keyword degildir, sonrada tanimlanan boolean anahtarlardir
  this.complete = false;

  //Move fruit
  this.update = () => {
    this.y += this.speed;//Meyvenin y eksenindeki konumu, meyvenin hızı (speed) kadar artırılır. Bu, meyvenin oyun alanında aşağıya doğru hareket etmesini sağlar.
    if (!this.complete && this.y + this.width > canvas.height) { //Eğer meyve henüz tamamlanmamışsa (!this.complete) ve meyvenin alt kenarı (this.y + this.width) oyun alanının yüksekliğine eşit veya daha büyükse (canvas.height), o zaman meyve tamamlanmış kabul edilir (this.complete = true;). Bu, meyvenin oyun alanının alt kenarına ulaştığını ve oyun dışına düştüğünü belirtir.
      this.complete = true; //tamamlandi olarak isaretleriz/ we mark as completed.
    }
  };

  //Draw fruit
  this.draw = () => {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.width); //drawImage js'de gömülü bir metoddur, canvas bağlamında belirtilen animasyon için verilen içerigi ve içerigin koordinat bilgilerini alır, normalde 5. parameter olarak height alır fakat burda nesneler tek düzlemden akacagi için buna ihtiyaç yok
  };
  this.compare = (mouseX, mouseY) => {//Bu metod farenin meyvenin koordinatları üzerinde olup olmadıgını kontrol eder içindeyse true degilse false döndürür
    return (
      mouseX >= this.x && //Eğer fare imleci meyvenin sol kenarının x koordinatından (this.x) daha büyük veya eşit bir değere sahipse, bu koşul doğru olacaktır. Yani, eğer fare imleci meyvenin içine girerse ve meyvenin sol kenarının x koordinatından itibaren ilerlerse, bu koşul sağlanır ve kullanıcı meyveyi tıklamış olur.
      mouseX <= this.x + this.width && //Bu koşul, fare imlecinin x koordinatının, meyvenin x koordinatıyla başlayıp meyvenin genişliği boyunca ilerleyip ilerlemediğini kontrol eder.Normalde, bir dikdörtgenin sağ kenarı, sol kenarının x koordinatıyla genişliğinin toplamına eşittir. Bu yüzden, fare imlecinin x koordinatı, meyvenin sol kenarının x koordinatı (this.x) ile meyvenin genişliği (this.width) eklenerek kontrol edilir.

      
      mouseY >= this.y &&
      mouseY <= this.y + this.width //Normalde, bir dikdörtgenin alt kenarı, üst kenarının y koordinatıyla genişliğinin toplamına eşittir. Bu yüzden, fare imlecinin y koordinatı, meyvenin üst kenarının y koordinatı (this.y) ile meyvenin genişliği (this.width) eklenerek kontrol edilir.
    );
  };
}

//Create a new fruit
function createRandomFruit() {
  //set random time for next fruit
  randomCreationTime = generateRandomNumber(3, 9); //her bir meyvenin çikacagi vaktin sabit olmamasi gerekir, bir meyve düstükten sonra diger meyve 3 ile 9 arasindaki herhangi bir deger sonra çikabilir, burada bu işlem sağlanır
  if (fruits.length < FRUIT_COUNT) { //meyveleri tuttuğumuz fruits dizimizin boyutu tanımladığımız FRUIT_COUNT sayisindan düsük oldugu sürece yeni meyve üretilmesini söylüyoruz
    let randomFruit =
      fruitsList[generateRandomNumber(0, fruitsList.length - 1)]; //fruitsList içerisinden rastgele bir meyve seçilmesi için generateRandomNumber fonksiyonunu kullanip gelen sonucu randomFruit degiskenine atiyoruz, bu degiskendeki degeri de bir sonraki satirda kulllanacagiz
    const randomImage = `${randomFruit}.png`; //rastgele seçtigimiiz FruitList elemanini randomFruit degiskenine atamıştık, burada da degiskenin tuttugu meyvenin contentini randomImage adli degiskene atıyoruz
    const randomX = generateRandomNumber(0, canvas.width - 50); //Meyvenin x koordinatı, canvas'in genişliği dahilinde rastgele olarak belirlenir.
    const fruitWidth = generateRandomNumber(100, 200); //Meyvenin genişliği de rastgele olarak belirlenir.Dikkat edelim sayfanın genişliği degil meyve resminin büyüüklüğü rastgele değiştiriliyor bazen küçük geliyor bazen büyük
    let fruit = new Fruit(randomImage, randomX, 0, fruitWidth); //Fruit constructor'ı kullanılarak yeni bir meyve nesnesi oluşturulur 
    fruits.push(fruit);//fruits dizisine eklenir.
  }
  if (fruits.length == FRUIT_COUNT) { //Eğer fruits dizisinin boyutu FRUIT_COUNT'a esitse checker diye bir boolean degiskenin her bir ögesine yani her bir meyveye
    let checker = fruits.every((fruit) => {//fruits'in içindeki her fruit için aşağıdaki işlemleri uygulayacağız
      return fruit.complete == true; //bir üstteki kod parçasında tanımladığımız boolean anahtardır, complete yerine kedi köpek bile yazabilirsin fark etmiyor, önemli olan benzer bilesenleri tek boolean anahtar altında birleştirmek 
    });
    if (checker) { //bir önceki satırda yarattığımız boolean değişken olan checker eger dogru olarak çiktiysa, hemen aynı if bloğunun altındaki if bloğuna girer
      clearInterval(interval); //bütün meyvelerin atışı tamamlandığı için yani fruits.length==FRUIT_COUNT oldugu için clearInterval fonksiyonu ile en üstte tanımladığımız interval denen oyun süresinin üretildiği değişkeni sıfırlama işlemini yapıyoruz, bu değişkene atadığımız randomTime işleminin nasıl ilerlediğini sonraki kodlarda göreceğiz
      coverScreen.classList.remove("hide");//coverScreen classından hide classını siliyoruz yani artık görünür oluyor burası bizim ana menümüz olan turuncuya yakın renkteki kısım
      canvas.classList.add("hide"); //animasyon bölgemiz olan canvas'a hide classını ekleyip invisible yapıyoruz
      overText.classList.remove("hide"); //overText kısmı yani GameOver yazısının olduğu bölümü görünür hale getiriyoruz
      result.innerText = `Final Score: ${points}`;
      startButton.innerText = "Restart Game";
      scoreContainer.classList.add("hide"); //skor kutucuğunu kaldırıyoruz
      
    }
  }
}
function animate() {//Bu fonksiyon, canvas üzerinde meyvelerin hareketini ve çizimini sürekli olarak günceller. Canvas zaten belirli bir html elemanını devamlı olarak emredilen koordinatlarda oynatmak anlamına gelir.
  ctx.clearRect(0, 0, canvas.width, canvas.height);//Canvası temizler.canvas'in tamamını temizler. x ve y koordinatları sıfır olarak belirlenir ve width ve height parametreleri canvas'in genişliği ve yüksekliği olarak atanır, böylece canvas tamamen temizlenir.
  for (const fruit of fruits) {
    fruit.update(); //Yukarıda tanımlamış olduğumuz, Fruit constructorını bir metodu olan update ve draw metodlarını çağırıyoruz her bir meyve için.
    fruit.draw();
  }
  requestAnimationFrame(animate);//requestAnimationFrame fonksiyonu kullanılarak animate fonksiyonu sürekli olarak çağrılır, böylece animasyon sürekli olarak güncellenir.
}
animate(); //tıklama eventi[aşağıda] gerçekleştiğinde yukarıdaki işlemler yapıldıktan sonra animate ve isTouchDevice fonksiyonları çalışır.
isTouchDevice();

canvas.addEventListener(events[deviceType].down, function (e) { //yukarda tanımladığımız events adlı nesnenin deviceType özelliğinde iki adet properti tanımlamıştık.
  let clickX = //bu kod bloğunun açıklaması en aşağıya uzunca yapılmıştır.
    (isTouchDevice() ? e.touches[0].pageX : e.pageX) - canvas.offsetLeft;
  let clickY =
    (isTouchDevice() ? e.touches[0].pageY : e.pageY) - canvas.offsetTop;
  fruits.forEach(function (fruit) {
    let check = fruit.compare(clickX, clickY);
    if (check && !fruit.clicked) {
      fruit.clicked = true;
      points += 1;
      scoreContainer.innerHTML = points;
      fruit.complete = true;
      fruit.y = canvas.height;
    }
  });
});

canvas.addEventListener("touchend", (e) => { //kullanici parmağını ekrandan çektiğinde sitenin tekrar yüklenmesi veya canvas alanını etkilemesi gibi durumları engellemek için bu fonksiyon kullanıldı örneğin dokunulduğunda sayfanın kayması gibi işlemler iptal edilir
  e.preventDefault();
});

setTimeout(function() {
  title.style.display="block";
  title.style.display = "none"; // Başlık elementinin görünürlüğünü none yaparak gizle
}, 5000); // 3 saniye (3000 milisaniye) sonra işlemi gerçekleştir

startButton.addEventListener("click", () => { //start tuşuna basıldığında fruits dizisi boşaltılır points değişkeni sıfıra eşitlenir, bu değer de scoreContainer denen siyah kutucuğun içindeki değere eşitlenir
  fruits = [];
  points = 0;
  scoreContainer.innerHTML = points;
  canvas.classList.remove("hide"); //canvas alanı aktive edilir
  coverScreen.classList.add("hide"); //ara menü kaldırılır
  createRandomFruit(); //rastgele meyveler üretilir
  randomCreationTime = generateRandomNumber(3, 9); //üretim zamanları rastgele üretilir ki kullanici meyvelerin düşme sürelerine alışamasın
  interval = setInterval(createRandomFruit, randomCreationTime * 1000); //setInterval fonksiyonu js'de gömülüdür, iki parametre alır, ilk parametresi çalıştırılacak fonksiyonun adıdır, ikinci parametresi ise bu fonksiyonun çalıştırılma sıklığının süresini belirtir, biz bunu random olarak alıyoruz bu program için
  scoreContainer.classList.remove("hide"); //scoreContainer yani siyah kutucuk görünür hale getirilr
});


//CANVAS EVENT LISTENER BLOGU AÇIKLAMASI
/*Bu kod, bir HTML canvas elementine bir olay dinleyici ekler. Olay türü, `events` nesnesindeki `deviceType` tarafından belirlenen cihaz türüne (`mouse` veya `touch`) bağlı olarak belirlenir. İşte kodun ayrıntılı açıklaması:

- `canvas.addEventListener(events[deviceType].down, function (e) { ... });`: Bu satırda, `addEventListener` yöntemi kullanılarak canvas elementine bir olay dinleyici eklenir. Olay türü, `events` nesnesindeki `deviceType` tarafından belirlenen cihaz türüne (`mouse` veya `touch`) bağlı olarak belirlenir. Örneğin, eğer `deviceType` değişkeni `"mouse"` ise, olay türü `"mousedown"` olur.
  
- `let clickX = (isTouchDevice() ? e.touches[0].pageX : e.pageX) - canvas.offsetLeft;`: Bu satırda, kullanıcının tıklama yaptığı X koordinatı hesaplanır. Eğer cihaz bir dokunmatik cihaz ise, `isTouchDevice()` fonksiyonu `true` döner ve tıklama olayı bir dokunmatik olayıdır. Bu durumda, tıklama olayı `e.touches[0].pageX` ile alınır. Aksi halde, yani cihaz bir fare kullanıyorsa, fare tıklama olayı `e.pageX` ile alınır. Son olarak, tıklama konumundan canvas elementinin sol kenarının uzaklığı (`canvas.offsetLeft`) çıkarılarak, canvas üzerindeki tıklamanın mutlak X koordinatı bulunur.

- `let clickY = (isTouchDevice() ? e.touches[0].pageY : e.pageY) - canvas.offsetTop;`: Bu satırda, kullanıcının tıklama yaptığı Y koordinatı hesaplanır. Benzer şekilde, dokunmatik cihaz kullanılıyorsa `e.touches[0].pageY`, fare kullanılıyorsa `e.pageY` ile tıklama koordinatları alınır. Son olarak, tıklama konumundan canvas elementinin üst kenarının uzaklığı (`canvas.offsetTop`) çıkarılarak, canvas üzerindeki tıklamanın mutlak Y koordinatı bulunur.

- `fruits.forEach(function (fruit) { ... });`: Bu döngüde, `fruits` dizisindeki her meyve için aşağıdaki işlemler gerçekleştirilir.

  - `let check = fruit.compare(clickX, clickY);`: Bu satırda, meyve nesnesinin `compare` metodunu kullanarak, tıklama konumunun meyve üzerinde olup olmadığı kontrol edilir. `compare` metodunun döndürdüğü değer `check` değişkenine atanır.
  
  - `if (check && !fruit.clicked) { ... }`: Bu satırda, `check` değeri `true` ve meyve daha önce tıklanmamışsa (`fruit.clicked` değeri `false`) if bloğuna girilir.
  
    - `fruit.clicked = true;`: Meyveye tıklandığını belirtmek için `fruit.clicked` değeri `true` olarak ayarlanır.
    
    - `points += 1;`: Oyuncunun puanı bir arttırılır.
    
    - `scoreContainer.innerHTML = points;`: Oyuncunun puanı HTML içeriğine (`scoreContainer` elementine) güncellenir.
    
    - `fruit.complete = true;`: Meyvenin tamamlandığını belirtmek için `fruit.complete` değeri `true` olarak ayarlanır.
    
    - `fruit.y = canvas.height;`: Meyvenin y koordinatı, canvas yüksekliğine eşitlenerek meyvenin ekranın dışına çıkması sağlanır. Bu, meyvenin ekrandan kaybolmasını sağlar.*/
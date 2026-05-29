
//funkcja generująca opis podpowiedzi na podstawie tekstu specyfikacji i jej typu
export const getSpecTooltipInfo = (type, label) => {
  const text = label.toLowerCase();
  
  let iconTooltip = "Jeszcze nie ma szczegółowych informacji dla tego podzespołu :/";
  let textTooltip = null; 

  switch (type) {
    case 'cpu':
      iconTooltip = "Procesor (CPU) to 'mózg' urządzenia. Odpowiada za to, jak szybko komputer przetwarza dane i wykonuje polecenia.";
      if (text.includes('i3') || text.includes('ryzen 3')) textTooltip = "Podstawowy segment – idealny do płynnej pracy biurowej, poczty i przeglądania internetu.";
      else if (text.includes('i5') || text.includes('ryzen 5')) textTooltip = "Średnia półka – świetny balans między wydajnością a baterią. Uniwersalny wybór.";
      else if (text.includes('i7') || text.includes('ryzen 7')) textTooltip = "Wysoki segment – potężna moc do wymagających zadań, programowania lub obróbki grafiki.";
      else if (text.includes('i9') || text.includes('ryzen 9')) textTooltip = "Najwyższa półka – ekstremalna wydajność, topowe rozwiązanie na rynku.";
      break;

    case 'ram':
      iconTooltip = "Pamięć RAM to 'krótkotrwała pamięć' komputera. Im jej więcej, z tym większą liczbą programów/zakładek możesz pracować bez zacinania.";
      if (text.includes('8gb') || text.includes('8 gb')) textTooltip = "8GB to absolutne minimum do komfortowej pracy biurowej w dzisiejszych czasach.";
      else if (text.includes('16gb') || text.includes('16 gb')) textTooltip = "16GB to złoty standard – wystarczy do swobodnej i wielozadaniowej pracy.";
      else if (text.includes('32gb') || text.includes('32 gb')) textTooltip = "32GB (lub więcej) to potężny zapas pamięci do baz danych, wirtualizacji i montażu wideo.";
      break;

    case 'disk':
      iconTooltip = "Dysk to miejsce, gdzie trwale instalowany jest system, programy oraz przechowywane są wszystkie pliki użytkownika.";
      const hasHDD = text.includes('hdd');
      const hasFast = text.includes('ssd') || text.includes('nvme') || text.includes('m.2');
      
      if (hasHDD && hasFast) {
        textTooltip = "Szybki dysk SSD na system operacyjny i programy oraz pojemny dysk HDD jako magazyn na ciężkie pliki.";
      } else if (hasFast) {
        textTooltip = "Dysk SSD jest wielokrotnie szybszy od tradycyjnego HDD. Komputer włącza się i działa błyskawicznie.";
      } else if (hasHDD) {
        textTooltip = "Dysk HDD to starsza technologia – jest wyraźnie wolniejszy, ale za to tani i bardzo pojemny.";
      }
      break;

    case 'gpu':
      iconTooltip = "Karta graficzna odpowiada za generowanie całego obrazu, który widzisz na ekranie monitora.";
      if (text.includes('zintegrowana') || text.includes('intel') || text.includes('amd radeon graphics')) {
        textTooltip = "Zintegrowana z procesorem – w zupełności wystarczy do pracy biurowej i oglądania filmów.";
      } else if (text.includes('gtx') || text.includes('rtx') || text.includes('rx') || text.includes('quadro')) {
        textTooltip = "Dedykowana (osobna) karta – zapewnia wysoką wydajność w grafice 3D, grach i programach inżynieryjnych.";
      }
      break;

    case 'case':
      iconTooltip = "Typ i rozmiar obudowy komputera stacjonarnego.";
      if (text.includes('tower') || text.includes('midi')) textTooltip = "Klasyczna, duża obudowa. Zapewnia najlepsze chłodzenie i mnóstwo miejsca na rozbudowę.";
      else if (text.includes('sff') || text.includes('small') || text.includes('micro') || text.includes('mini')) textTooltip = "Kompaktowa obudowa (SFF). Zajmuje mało miejsca na biurku, ale ma ograniczone możliwości rozbudowy.";
      else if (text.includes('desktop') || text.includes('usff') || text.includes('tiny')) textTooltip = "Mikrokomputer – ultramały rozmiar, często można go zamontować na plecach monitora (VESA).";
      break;

    case 'size':
      iconTooltip = "Przekątna fizyczna ekranu monitora, mierzona w calach (\").";
      const sizeMatch = text.match(/[\d.,]+/);
      if (sizeMatch) {
        const sizeNum = parseFloat(sizeMatch[0].replace(',', '.'));
        if (sizeNum < 24) textTooltip = "Mniejszy ekran – dobry do ciasnych biurek lub jako monitor pomocniczy.";
        else if (sizeNum >= 24 && sizeNum <= 25) textTooltip = "24 cale to rynkowy, najbardziej uniwersalny standard do typowej pracy biurowej.";
        else if (sizeNum > 25 && sizeNum <= 28) textTooltip = "27 cali to bardzo komfortowy, duży obszar roboczy – świetny do pracy w wielu oknach naraz.";
        else if (sizeNum > 28) textTooltip = "Ogromny ekran (często Ultrawide), dedykowany analitykom, programistom i grafikom.";
      }
      break;

    case 'resolution':
      iconTooltip = "Rozdzielczość ekranu – im więcej pikseli, tym ostrzejszy obraz i więcej szczegółów mieści się na ekranie.";
      if (text.includes('fhd') || text.includes('1920') || text.includes('1080')) textTooltip = "Full HD (1080p) – standardowa, powszechna rozdzielczość. Wystarczająca dla większości użytkowników.";
      else if (text.includes('qhd') || text.includes('1440') || text.includes('2k')) textTooltip = "QHD / 2K (1440p) – znacznie ostrzejszy obraz, pozwala zmieścić więcej aplikacji na ekranie niż Full HD.";
      else if (text.includes('uhd') || text.includes('4k') || text.includes('2160')) textTooltip = "4K UHD – niesamowita ostrość tekstu i grafiki. Wymaga mocniejszego komputera do płynnego działania.";
      break;

    case 'aspect_ratio':
      iconTooltip = "Proporcje ekranu, czyli stosunek jego szerokości do wysokości.";
      if (text.includes('16:9')) textTooltip = "16:9 – standardowe, panoramiczne proporcje. Najlepsze do multimediów.";
      else if (text.includes('16:10')) textTooltip = "16:10 – ekran jest odrobinę wyższy. Bardzo cenione w biznesie, bo mieści więcej wierszy tekstu/kodu.";
      else if (text.includes('21:9') || text.includes('ultrawide')) textTooltip = "21:9 (Ultrawide) – bardzo szeroki ekran. Często z powodzeniem zastępuje konfigurację z dwoma monitorami.";
      break;

    case 'ports':
      iconTooltip = "Liczba dostępnych portów sieciowych (zazwyczaj RJ-45) w urządzeniu dystrybuującym sieć.";
      const portsMatch = text.match(/\d+/);
      if (portsMatch) {
        const p = parseInt(portsMatch[0], 10);
        if (p <= 8) textTooltip = "Mały switch biurkowy (SOHO) – idealny do podłączenia kilku urządzeń w jednym pokoju.";
        else if (p > 8 && p <= 16) textTooltip = "Średni przełącznik, obsłuży małe biuro lub domową sieć z wieloma gniazdkami.";
        else if (p > 16 && p <= 24) textTooltip = "Standardowy switch typu RACK (24 porty) – kręgosłup sieci dla średnich firm.";
        else if (p > 24) textTooltip = "Duży, zaawansowany switch (48 portów) – infrastruktura dla całych pięter korporacyjnych.";
      }
      break;
  }

  return { iconTooltip, textTooltip };
};
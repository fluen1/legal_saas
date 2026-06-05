export interface GuideContent {
  slug: string;
  title: string;
  subtitle: string;
  metaDescription: string;
  keywords: string[];
  legalBasis: string;
  whatIs: {
    heading: string;
    paragraphs: string[];
  };
  legalRequirements: {
    heading: string;
    items: string[];
  };
  commonMistakes: {
    heading: string;
    items: { mistake: string; consequence: string }[];
  };
  checklist: {
    heading: string;
    items: string[];
  };
}

export const guides: GuideContent[] = [
  {
    slug: 'ansaettelseskontrakt',
    title: 'Ansættelseskontrakt — hvad skal den indeholde?',
    subtitle:
      'Alt du skal vide om lovkrav, indhold og typiske fejl i ansættelseskontrakter for danske virksomheder.',
    metaDescription:
      'Hvad skal en ansættelseskontrakt indeholde? Se lovkrav, tjekliste og de 5 typiske fejl danske virksomheder laver. Opdateret guide til SMV-ejere.',
    keywords: [
      'ansættelseskontrakt',
      'ansættelsesbevis',
      'ansættelseskontrakt skabelon',
      'ansættelsesbevisloven',
      'kontrakt medarbejder',
      'ansættelsesvilkår',
    ],
    legalBasis: 'Ansættelsesbevisloven (LBK nr. 907 af 2024)',
    whatIs: {
      heading: 'Hvad er en ansættelseskontrakt?',
      paragraphs: [
        'En ansættelseskontrakt er et dokument der beskriver vilkårene for en ansættelse — alt fra løn og arbejdstid til opsigelsesvarsel og ferie. Det er den aftale, du og din medarbejder indgår, når I starter et samarbejde.',
        'Siden 1. juli 2023 har alle medarbejdere der arbejder mere end 3 timer om ugen i gennemsnit over 4 uger krav på et ansættelsesbevis. Det gælder også timelønnede, deltid og tidsbegrænsede stillinger.',
        'Som arbejdsgiver skal du udlevere ansættelsesbeviset senest 7 dage efter første arbejdsdag for de vigtigste oplysninger, og senest en måned efter for de øvrige.',
      ],
    },
    legalRequirements: {
      heading: 'Det kræver loven',
      items: [
        'Arbejdsgivers og medarbejders navn og adresse',
        'Arbejdsstedets beliggenhed (eller angivelse af skiftende arbejdssteder)',
        'Stillingsbetegnelse, rang eller jobkategori',
        'Ansættelsesforholdets begyndelsesdato',
        'Forventet varighed ved tidsbegrænsede ansættelser',
        'Ret til ferie og ferielønsvilkår',
        'Opsigelsesvarsler for begge parter',
        'Løn, tillæg, pension og udbetalingsterminer',
        'Normal daglig eller ugentlig arbejdstid og eventuel overtidsordning',
        'Gældende overenskomst, hvis relevant',
        'Prøveperiode og vilkår herfor',
        'Eventuel konkurrence- eller kundeklausul',
      ],
    },
    commonMistakes: {
      heading: 'De 5 typiske fejl danske virksomheder laver',
      items: [
        {
          mistake: 'Ansættelsesbeviset udleveres for sent',
          consequence:
            'Loven kræver det senest 7 dage efter første arbejdsdag. Forsinket udlevering kan medføre godtgørelse på op til 13 ugers løn.',
        },
        {
          mistake: 'Lønoplysninger er upræcise eller mangler',
          consequence:
            'Manglende specificering af grundløn, tillæg og pension giver usikkerhed og kan koste dig dyrt ved en tvist.',
        },
        {
          mistake: 'Der mangler vilkår for prøveperiode',
          consequence:
            'Uden skriftlig aftale om prøve gælder ingen prøvetid, og du kan ikke benytte det forkortede opsigelsesvarsel.',
        },
        {
          mistake: 'Arbejdstid er ikke defineret',
          consequence:
            'Upræcis angivelse af normal arbejdstid gør det svært at håndtere overtid og gør dig sårbar ved arbejdstidsdirektivets regler.',
        },
        {
          mistake: 'Konkurrenceklausuler er ugyldigt formuleret',
          consequence:
            'En klausul der ikke opfylder kravene i ansættelsesklausulloven er ugyldig — og du har betalt kompensation for en beskyttelse der ikke gælder.',
        },
      ],
    },
    checklist: {
      heading: 'Tjekliste — er din virksomhed på plads?',
      items: [
        'Har alle medarbejdere fået et skriftligt ansættelsesbevis?',
        'Er beviset udleveret inden for 7 dage efter første arbejdsdag?',
        'Indeholder kontrakten præcis løn, tillæg og pensionsvilkår?',
        'Er normal arbejdstid og overtidbetaling klart beskrevet?',
        'Er opsigelsesvarsel for begge parter angivet korrekt?',
        'Er eventuelle konkurrence- eller kundeklausuler lovligt formuleret?',
        'Er kontrakten opdateret i henhold til loven af 2023?',
      ],
    },
  },
  {
    slug: 'gdpr-tjekliste',
    title: 'GDPR-tjekliste for små virksomheder',
    subtitle:
      'En praktisk gennemgang af de GDPR-krav din virksomhed skal overholde — uden juridisk sprogbrug.',
    metaDescription:
      'GDPR-tjekliste til små virksomheder. Se de konkrete krav, typiske fejl og få en interaktiv tjekliste. Simpel guide til danske SMV-ejere.',
    keywords: [
      'GDPR tjekliste',
      'GDPR små virksomheder',
      'persondataforordningen',
      'databeskyttelse',
      'GDPR krav Danmark',
      'privatlivspolitik',
    ],
    legalBasis:
      'Databeskyttelsesforordningen (GDPR) + Databeskyttelsesloven',
    whatIs: {
      heading: 'Hvad er GDPR?',
      paragraphs: [
        'GDPR (General Data Protection Regulation) er EU\'s persondataforordning, der har været gældende siden 2018. Den fastsætter reglerne for, hvordan virksomheder må indsamle, opbevare og bruge personoplysninger — fx navne, e-mails, CPR-numre og IP-adresser.',
        'Alle danske virksomheder der behandler persondata er omfattet — uanset størrelse. Det gælder også hvis du kun har en hjemmeside med en kontaktformular eller sender nyhedsbreve.',
        'Overtrædelser kan medføre bøder på op til 4 % af den globale årsomsætning eller 150 mio. kr. — og Datatilsynet fører aktivt tilsyn, også med mindre virksomheder.',
      ],
    },
    legalRequirements: {
      heading: 'Det kræver loven',
      items: [
        'Lovligt grundlag for al behandling af persondata (fx samtykke, kontrakt eller legitim interesse)',
        'Privatlivspolitik der forklarer hvilke data du indsamler, hvorfor, og hvor længe',
        'Databehandleraftale med alle leverandører der behandler data på dine vegne (fx hosting, nyhedsbrevssystem)',
        'Fortegnelse over behandlingsaktiviteter (artikel 30) — også kaldet en ROPA',
        'Procedure for håndtering af indsigtsanmodninger fra registrerede (besvar inden 30 dage)',
        'Sikkerhedsforanstaltninger der beskytter data mod tab og uautoriseret adgang',
        'Anmeldelse af brud på persondatasikkerheden til Datatilsynet inden 72 timer',
        'Cookiebanner med aktivt samtykke for ikke-nødvendige cookies',
      ],
    },
    commonMistakes: {
      heading: 'De 5 typiske fejl danske virksomheder laver',
      items: [
        {
          mistake: 'Ingen privatlivspolitik på hjemmesiden',
          consequence:
            'Et af de første ting Datatilsynet tjekker. Manglende oplysningspligt er en direkte overtrædelse af GDPR artikel 13.',
        },
        {
          mistake: 'Cookies sættes før brugerens samtykke',
          consequence:
            'Tredjepartscookies (analytics, marketing) kræver aktivt samtykke. Pre-ticked checkboxes tæller ikke.',
        },
        {
          mistake: 'Manglende databehandleraftaler',
          consequence:
            'Bruger du Mailchimp, Google Analytics eller et hostingfirma? Så behandler de data på dine vegne, og du skal have en skriftlig aftale.',
        },
        {
          mistake: 'Persondata opbevares uden tidsbegrænsning',
          consequence:
            'Du skal fastsætte og overholde slettefrister. Data må kun opbevares så længe det er nødvendigt for formålet.',
        },
        {
          mistake: 'Ingen procedure for databrud',
          consequence:
            'Hvis du opdager et brud mandag morgen, har du 72 timer til at anmelde det. Uden en procedure kan det nemt glippe.',
        },
      ],
    },
    checklist: {
      heading: 'Tjekliste — er din virksomhed på plads?',
      items: [
        'Har du en opdateret privatlivspolitik på din hjemmeside?',
        'Har du et lovligt cookiebanner med aktivt samtykke?',
        'Har du databehandleraftaler med alle dine IT-leverandører?',
        'Har du en fortegnelse over dine behandlingsaktiviteter?',
        'Ved du hvordan du håndterer en indsigtsanmodning inden 30 dage?',
        'Har du fastsat slettefrister for persondata?',
        'Har du en beredskabsplan for databrud?',
      ],
    },
  },
  {
    slug: 'databehandleraftale',
    title: 'Databehandleraftale — hvornår er den lovpligtig?',
    subtitle:
      'Forstå hvornår du skal have en databehandleraftale, og hvad den skal indeholde.',
    metaDescription:
      'Hvornår er en databehandleraftale lovpligtig? Se krav, indhold og typiske fejl. Praktisk guide til danske virksomheder der bruger IT-leverandører.',
    keywords: [
      'databehandleraftale',
      'databehandleraftale skabelon',
      'GDPR artikel 28',
      'DPA',
      'databehandler',
      'dataansvarlig',
    ],
    legalBasis: 'GDPR Art. 28',
    whatIs: {
      heading: 'Hvad er en databehandleraftale?',
      paragraphs: [
        'En databehandleraftale (DPA) er en juridisk bindende aftale mellem dig som dataansvarlig og en leverandør der behandler persondata på dine vegne — fx dit hostingfirma, din e-mailudbyder eller dit lønsystem.',
        'Aftalen sikrer, at din leverandør kun bruger data til det aftalte formål, har tilstrækkelig sikkerhed, og overholder de samme regler som dig selv. Uden aftalen bryder du GDPR — også selvom leverandøren er troværdig.',
        'Du har som dataansvarlig det fulde ansvar for, at aftalen er på plads. Det er ikke leverandørens opgave at foreslå det — det er din pligt.',
      ],
    },
    legalRequirements: {
      heading: 'Det kræver loven',
      items: [
        'Skriftlig aftale med enhver leverandør der behandler persondata på dine vegne',
        'Beskrivelse af behandlingens genstand, varighed, art og formål',
        'Typen af personoplysninger og kategorier af registrerede',
        'Databehandleren må kun handle efter dokumenteret instruks fra dig',
        'Krav om fortrolighed for alle der behandler data',
        'Passende tekniske og organisatoriske sikkerhedsforanstaltninger',
        'Betingelser for brug af underdatabehandlere (krav om din godkendelse)',
        'Bistand ved indsigtsanmodninger og brud på persondatasikkerheden',
        'Sletning eller tilbagelevering af data ved aftalens ophør',
        'Mulighed for audit og inspektion',
      ],
    },
    commonMistakes: {
      heading: 'De 5 typiske fejl danske virksomheder laver',
      items: [
        {
          mistake: 'Tror at store leverandører automatisk er dækkede',
          consequence:
            'Selvom Google eller Microsoft tilbyder en standard-DPA, skal du aktivt acceptere den. Den gælder ikke automatisk.',
        },
        {
          mistake: 'Glemmer leverandører uden for EU',
          consequence:
            'Data der overføres til lande uden for EU/EØS kræver særlige garantier ud over selve databehandleraftalen.',
        },
        {
          mistake: 'Aftalen mangler beskrivelse af sikkerhedsforanstaltninger',
          consequence:
            'En generisk aftale uden konkrete sikkerhedskrav opfylder ikke GDPR artikel 28, stk. 3, litra c.',
        },
        {
          mistake: 'Ingen styring af underdatabehandlere',
          consequence:
            'Din leverandør bruger måske underleverandører. Uden aftale om godkendelse mister du kontrollen med dine kunders data.',
        },
        {
          mistake: 'Aftalen er aldrig blevet opdateret',
          consequence:
            'Ældre aftaler mangler ofte krav om brudnotifikation og slettefrister. En DPA fra før 2018 er næsten sikkert utilstrækkelig.',
        },
      ],
    },
    checklist: {
      heading: 'Tjekliste — er din virksomhed på plads?',
      items: [
        'Har du identificeret alle leverandører der behandler persondata for dig?',
        'Har du en skriftlig databehandleraftale med hver af dem?',
        'Beskriver aftalen præcist hvilke data der behandles og hvorfor?',
        'Er der krav om din godkendelse før brug af underdatabehandlere?',
        'Indeholder aftalen konkrete sikkerhedsforanstaltninger?',
        'Er der aftalt procedure for databrud og indsigtsanmodninger?',
      ],
    },
  },
  {
    slug: 'nda-fortrolighedsaftale',
    title: 'NDA og fortrolighedsaftale — hvad er forskellen?',
    subtitle:
      'Lær hvornår du har brug for en NDA, og hvad den skal indeholde for at beskytte din virksomhed.',
    metaDescription:
      'NDA vs. fortrolighedsaftale — hvad er forskellen? Se hvornår du har brug for en, hvad den skal indeholde, og undgå de typiske fejl.',
    keywords: [
      'NDA',
      'fortrolighedsaftale',
      'hemmeligholdelsesaftale',
      'NDA skabelon',
      'forretningshemmeligheder',
      'NDA Danmark',
    ],
    legalBasis: 'Aftaleloven + Markedsføringsloven',
    whatIs: {
      heading: 'Hvad er en NDA?',
      paragraphs: [
        'En NDA (Non-Disclosure Agreement) — også kaldet en fortrolighedsaftale — er en aftale der forpligter en eller begge parter til at holde bestemte oplysninger hemmelige. Begreberne bruges i praksis synonymt i Danmark.',
        'Du har typisk brug for en NDA, når du deler forretningsfølsomme oplysninger med potentielle samarbejdspartnere, investorer, freelancere eller nye medarbejdere. Det kan være alt fra kundeoversigter og prismodeller til tekniske løsninger og forretningsplaner.',
        'En NDA er ikke lovpligtig, men uden den har du meget begrænset beskyttelse, hvis nogen misbruger dine forretningshemmeligheder. Markedsføringslovens regler om god erhvervsskik giver kun en grundlæggende beskyttelse.',
      ],
    },
    legalRequirements: {
      heading: 'Det kræver en gyldig NDA',
      items: [
        'Præcis definition af hvilke oplysninger der er fortrolige',
        'Angivelse af parterne (hvem der afgiver og modtager information)',
        'Formål med videregivelsen af de fortrolige oplysninger',
        'Varighed — hvor længe fortrolighedspligten gælder (typisk 2-5 år)',
        'Undtagelser: oplysninger der allerede er offentligt kendte, modtaget fra tredjepart, eller udviklet uafhængigt',
        'Konsekvenser ved brud (konventionalbod eller erstatningsansvar)',
        'Bestemmelse om tilbagelevering eller sletning af materiale ved aftalens ophør',
      ],
    },
    commonMistakes: {
      heading: 'De 5 typiske fejl danske virksomheder laver',
      items: [
        {
          mistake:
            'For bred definition af fortrolige oplysninger ("alt er fortroligt")',
          consequence:
            'Domstolene kan tilsidesætte aftalen som urimelig. Vær specifik om hvad der er beskyttet.',
        },
        {
          mistake: 'Ingen tidsbegrænsning på fortrolighedspligten',
          consequence:
            'En evighedsgældende NDA kan være urimelig efter aftaleloven § 36 og dermed ugyldig.',
        },
        {
          mistake: 'Manglende konsekvenser ved brud',
          consequence:
            'Uden konventionalbod skal du bevise dit tab — hvilket er ekstremt svært ved lækage af forretningshemmeligheder.',
        },
        {
          mistake: 'NDA underskrives efter information allerede er delt',
          consequence:
            'En NDA beskytter kun fremadrettet. Information delt før underskrift er typisk ikke dækket.',
        },
        {
          mistake: 'Bruger en engelsksproget skabelon uden tilpasning',
          consequence:
            'Udenlandske skabeloner indeholder ofte klausuler der ikke er gyldige efter dansk ret (fx "injunctive relief").',
        },
      ],
    },
    checklist: {
      heading: 'Tjekliste — er din virksomhed på plads?',
      items: [
        'Har du NDA-aftaler med freelancere og eksterne samarbejdspartnere?',
        'Er fortrolige oplysninger præcist defineret i aftalen?',
        'Er der en rimelig tidsbegrænsning på fortrolighedspligten?',
        'Indeholder aftalen en konventionalbod ved brud?',
        'Underskrives NDA før fortrolig information deles?',
        'Er aftalen tilpasset dansk ret?',
      ],
    },
  },
  {
    slug: 'handelsbetingelser',
    title: 'Handelsbetingelser — hvad skal de indeholde?',
    subtitle:
      'Sådan opstiller du korrekte handelsbetingelser der beskytter din virksomhed og opfylder loven.',
    metaDescription:
      'Hvad skal handelsbetingelser indeholde? Se lovkrav for B2B og B2C, typiske fejl og en tjekliste til din webshop eller virksomhed.',
    keywords: [
      'handelsbetingelser',
      'salgs- og leveringsbetingelser',
      'handelsbetingelser webshop',
      'forbrugeraftaleloven',
      'e-handelsloven',
      'købsvilkår',
    ],
    legalBasis: 'E-handelsloven + Forbrugeraftaleloven',
    whatIs: {
      heading: 'Hvad er handelsbetingelser?',
      paragraphs: [
        'Handelsbetingelser (også kaldet salgs- og leveringsbetingelser eller købsvilkår) er de regler der gælder, når du sælger produkter eller ydelser. De beskriver alt fra levering og betaling til reklamationsret og ansvarsbegrænsning.',
        'Sælger du til forbrugere (B2C) — fx via en webshop — stiller forbrugeraftaleloven strenge krav til, hvad du skal oplyse før købet. Sælger du til andre virksomheder (B2B), har du større frihed, men klare vilkår forhindrer tvister.',
        'Uden tydelige handelsbetingelser risikerer du at stå uden beskyttelse ved reklamationer, forsinkelser eller betalingstvister. Det er dit ansvar at gøre vilkårene tilgængelige før købet.',
      ],
    },
    legalRequirements: {
      heading: 'Det kræver loven',
      items: [
        'Virksomhedens fulde navn, adresse, CVR-nummer og kontaktoplysninger',
        'Klar beskrivelse af varen eller ydelsen og den samlede pris inkl. moms og afgifter',
        'Leverings- og betalingsbetingelser',
        'Fortrydelsesret på 14 dage ved B2C-fjernsalg (med tydelig vejledning og standardfortrydelsesformular)',
        'Reklamationsret på 24 måneder for forbrugere',
        'Oplysning om klagemuligheder (fx Nævnenes Hus og EU\'s online-klageportal)',
        'Ved abonnementer: bindingsperiode, opsigelsesvilkår og automatisk fornyelse',
        'Oplysning om persondata (link til privatlivspolitik)',
      ],
    },
    commonMistakes: {
      heading: 'De 5 typiske fejl danske virksomheder laver',
      items: [
        {
          mistake: 'Fortrydelsesret mangler eller er forkert beskrevet',
          consequence:
            'Uden korrekt oplysning om fortrydelsesretten forlænges den automatisk med op til 12 måneder.',
        },
        {
          mistake: 'Priser vises uden moms',
          consequence:
            'Ved salg til forbrugere skal den samlede pris inkl. moms og alle afgifter være tydelig. Skjulte omkostninger er ulovlige.',
        },
        {
          mistake: 'Vilkår er kun tilgængelige efter købet',
          consequence:
            'Handelsbetingelserne skal være tilgængelige og accepteret før ordrebekræftelse. Ellers er de ikke bindende.',
        },
        {
          mistake: 'Copy-paste fra en anden virksomhed',
          consequence:
            'Vilkår der ikke matcher din forretningsmodel skaber falsk tryghed og kan indeholde ugyldige klausuler.',
        },
        {
          mistake: 'Manglende klageinformation',
          consequence:
            'Du er forpligtet til at oplyse om klagemuligheder. Manglende oplysning kan medføre påbud fra Forbrugerombudsmanden.',
        },
      ],
    },
    checklist: {
      heading: 'Tjekliste — er din virksomhed på plads?',
      items: [
        'Er dine handelsbetingelser synlige og tilgængelige før købet?',
        'Indeholder de virksomhedens fulde kontaktoplysninger og CVR-nummer?',
        'Er fortrydelsesretten korrekt beskrevet med standardformular?',
        'Er alle priser vist inkl. moms og afgifter?',
        'Er reklamationsret og klageadgang tydeligt angivet?',
        'Er vilkårene tilpasset om du sælger B2B, B2C eller begge?',
      ],
    },
  },
  {
    slug: 'arbejdsmiljoe',
    title: 'Arbejdsmiljø — hvad er du forpligtet til som arbejdsgiver?',
    subtitle:
      'Få overblik over dine pligter som arbejdsgiver inden for fysisk og psykisk arbejdsmiljø.',
    metaDescription:
      'Hvad kræver arbejdsmiljøloven af dig som arbejdsgiver? Se konkrete krav, typiske fejl og tjekliste til danske SMV-ejere. Opdateret guide.',
    keywords: [
      'arbejdsmiljø',
      'arbejdsmiljøloven',
      'APV',
      'arbejdspladsvurdering',
      'arbejdsmiljø krav',
      'psykisk arbejdsmiljø',
      'arbejdsgiver pligter',
    ],
    legalBasis: 'Arbejdsmiljøloven (LBK nr. 2062 af 2021)',
    whatIs: {
      heading: 'Hvad er arbejdsmiljøloven?',
      paragraphs: [
        'Arbejdsmiljøloven fastsætter de regler, du som arbejdsgiver skal følge for at sikre et sundt og sikkert arbejdsmiljø — både fysisk og psykisk. Loven gælder for alle virksomheder med ansatte.',
        'Som arbejdsgiver har du det overordnede ansvar for arbejdsmiljøet. Det betyder, at du skal forebygge risici, udarbejde en arbejdspladsvurdering (APV) og sørge for, at medarbejderne har de rette vilkår.',
        'Arbejdstilsynet fører tilsyn og kan give påbud, forbud og bøder. I alvorlige tilfælde kan det medføre politianmeldelse. Også små virksomheder med få medarbejdere får tilsynsbesøg.',
      ],
    },
    legalRequirements: {
      heading: 'Det kræver loven',
      items: [
        'Arbejdspladsvurdering (APV) der dækker fysisk og psykisk arbejdsmiljø — skal opdateres mindst hvert 3. år',
        'Arbejdsmiljøorganisation (AMO) i virksomheder med 10+ ansatte',
        'Lovpligtig arbejdsmiljøuddannelse for arbejdsmiljørepræsentanter og ledere (3 dages kursus)',
        'Instruktion og oplæring af medarbejdere i sikker udførelse af arbejdet',
        'Forebyggelse af fysiske risici: støj, ergonomi, farlige stoffer, tunge løft',
        'Forebyggelse af psykiske risici: stress, krænkende handlinger, højt arbejdspres',
        'Anmeldelse af arbejdsulykker til Arbejdstilsynet inden 9 dage',
        'Adgang til toiletter, spiseplads, dagslys og forsvarlig ventilation',
      ],
    },
    commonMistakes: {
      heading: 'De 5 typiske fejl danske virksomheder laver',
      items: [
        {
          mistake: 'Ingen APV eller en forældet APV',
          consequence:
            'APV er lovpligtig for alle virksomheder med ansatte. Manglende APV er den hyppigste årsag til påbud fra Arbejdstilsynet.',
        },
        {
          mistake: 'Psykisk arbejdsmiljø ignoreres',
          consequence:
            'Stress, mobning og krænkende handlinger er omfattet af loven. Arbejdstilsynet kan give påbud om psykisk arbejdsmiljø.',
        },
        {
          mistake:
            'Arbejdsmiljøuddannelse mangler for ledere og repræsentanter',
          consequence:
            'Den 3-dages lovpligtige uddannelse skal gennemføres inden 3 måneder efter valg/udpegning.',
        },
        {
          mistake: 'Arbejdsulykker anmeldes ikke',
          consequence:
            'Ulykker der medfører fravær ud over tilskadekomstdagen skal anmeldes. Manglende anmeldelse er strafbart.',
        },
        {
          mistake: 'Ingen dokumentation for instruktion',
          consequence:
            'Du skal kunne dokumentere at medarbejdere er instrueret i sikker opgaveløsning. Mundtlig instruktion alene er utilstrækkelig.',
        },
      ],
    },
    checklist: {
      heading: 'Tjekliste — er din virksomhed på plads?',
      items: [
        'Har du en opdateret APV (maks 3 år gammel)?',
        'Dækker din APV både fysisk og psykisk arbejdsmiljø?',
        'Har arbejdsmiljørepræsentanter gennemført den lovpligtige uddannelse?',
        'Har du en procedure for anmeldelse af arbejdsulykker?',
        'Er medarbejdere instrueret og oplært i sikker opgaveløsning?',
        'Har du styr på ergonomi, støj og indeklima på arbejdspladsen?',
      ],
    },
  },
];

export function getGuideBySlug(slug: string): GuideContent | undefined {
  return guides.find((g) => g.slug === slug);
}

import { categoryResource, eventResource, userResource } from "../Resources";
import { IAddress } from "../model/UserModel";
import EventService from "../services/EventService";
import { UserService } from "../services/UserService";

const createTestData = async () => {
  const a: IAddress = {
    postalCode: "54321",
    city: "Berlin",
  };

  const u: userResource = {
    email: "John@some-host.de",
    name: {
      first: "John",
      last: "Doe",
    },
    password: "12abcAB!",
    isAdministrator: false,
    address: a,
    birthDate: new Date("2000-06-14"),
    profilePicture:
      "/b6e07b53-ceda-47a9-bcb7-982dab8d42a2-pexels-andrew-personal-training-697509.jpg",
    gender: "male",
    isActive: true,
  };

  const u2: userResource = {
    email: "Jane@some-host.de",
    name: {
      first: "Jane",
      last: "Doe",
    },
    password: "12abcAB!",
    isAdministrator: false,
    address: a,
    birthDate: new Date("2000-04-10"),
    profilePicture:
      "/5755979f-77b5-434a-a138-ba8a04123a7c-gabriel-silverio-u3WmDyKGsrY-unsplash.jpg",
    gender: "female",
    isActive: true,
  };

  const u3: userResource = {
    email: "Bob@some-host.de",
    name: {
      first: "Bob",
      last: "Smith",
    },
    password: "34defCD!",
    isAdministrator: false,
    address: a,
    birthDate: new Date("1998-09-22"),
    profilePicture:
      "/603730c2-9900-4933-88db-31ab0b716c20-pexels-spencer-selover-428364.jpg",
    gender: "male",
    isActive: true,
  };

  const u4: userResource = {
    email: "Alice@some-host.de",
    name: {
      first: "Alice",
      last: "Johnson",
    },
    password: "56ghiEF!",
    isAdministrator: false,
    address: a,
    birthDate: new Date("1995-11-30"),
    profilePicture:
      "/6575e27b-4a7c-4c25-96fb-8d21fd4b0131-pexels-ike-louie-natividad-2709388.jpg",
    gender: "female",
    isActive: true,
  };

  const u5: userResource = {
    email: "Tom@some-host.de",
    name: {
      first: "Tom",
      last: "Brown",
    },
    password: "78jklGH!",
    isAdministrator: false,
    address: a,
    birthDate: new Date("1992-08-18"),
    profilePicture:
      "/9ce763e8-b534-43b5-b966-32ff0656da52-pexels-jack-winbow-1559486.jpg",
    gender: "male",
    isActive: true,
  };

  const u6: userResource = {
    email: "Emily@some-host.de",
    name: {
      first: "Emily",
      last: "Wilson",
    },
    password: "90mnoIJ!",
    isAdministrator: false,
    address: a,
    birthDate: new Date("1994-03-25"),
    profilePicture:
      "/6214908e-0324-4d71-8fa2-5dd584869f7a-pexels-andrea-piacquadio-733872.jpg",
    gender: "female",
    isActive: true,
  };

  const u8: userResource = {
    email: "Olivia@some-host.de",
    name: {
      first: "Olivia",
      last: "Davis",
    },
    password: "34pqrPQR!",
    isAdministrator: false,
    address: a,
    birthDate: new Date("1997-05-20"),
    profilePicture:
      "/2411f4e4-f8ce-47af-a9cc-25a8526d4392-michael-dam-mEZ3PoFGs_k-unsplash.jpg",
    gender: "female",
    isActive: true,
  };

  const u9: userResource = {
    email: "Charlie@some-host.de",
    name: {
      first: "Charlie",
      last: "Clark",
    },
    password: "56stuSTU!",
    isAdministrator: false,
    address: a,
    birthDate: new Date("1993-10-15"),
    profilePicture:
      "/17571a15-2bb1-40c0-9722-6e2e38174e0d-pexels-italo-melo-2379004.jpg",
    gender: "male",
    isActive: true,
  };

  const userService: UserService = new UserService();
  const john = await userService.createUser(u);
  const jane = await userService.createUser(u2);
  const bob = await userService.createUser(u3);
  const alice = await userService.createUser(u4);
  const tom = await userService.createUser(u5);
  const emily = await userService.createUser(u6);
  const olivia = await userService.createUser(u8);
  const charlie = await userService.createUser(u9);

  const category1: categoryResource = {
    name: "Music",
    description: "Music Event",
  };
  const category2: categoryResource = {
    name: "Art",
    description: "Art Event",
  };

  const categories = [
    {
      name: "Kultur & Kunst",
      description: "Events im Bereich Kultur und Kunst",
    },
    { name: "Konzert", description: "Konzertveranstaltungen" },
    { name: "Sport & Fitness", description: "Sportliche und Fitness-Events" },
    { name: "Gaming", description: "Gaming-Veranstaltungen" },
    {
      name: "Hobbys",
      description: "Events rund um Hobbys und Freizeitaktivitäten",
    },
    { name: "Outdoor", description: "Outdoor-Aktivitäten und Veranstaltungen" },
    { name: "Social", description: "Soziale Veranstaltungen und Treffpunkte" },
  ];

  const event1: eventResource = {
    name: "Summer Music Festival",
    description:
      "Ein großes Festival mit verschiedenen Musikgenres und lokalen Künstlern.",
    price: 50,
    date: new Date("2024-06-21"),
    address: {
      street: "Musikstraße",
      houseNumber: "1",
      city: "Berlin",
      postalCode: "10115",
      country: "Deutschland",
    },
    category: [category1],
    hashtags: ["party", "Party", "food", "Food"],
    thumbnail: "/pexels-wendy-wei-2342409.jpg",
  };

  const event2: eventResource = {
    name: "Street Food Market",
    description:
      "Eine kulinarische Reise durch die Street Food Kulturen der Welt.",
    price: 10,
    date: new Date("2024-07-10"),
    address: {
      street: "Gourmetplatz",
      houseNumber: "5",
      city: "Hamburg",
      postalCode: "20095",
      country: "Deutschland",
    },
    hashtags: ["Food", "food"],
    participants: [],
    thumbnail: "/pexels-sarah-chai-7267031.jpg",
  };

  const event3: eventResource = {
    name: "Coding Workshop",
    description: "Ein interaktiver Workshop für Anfänger im Programmieren.",
    price: 0,
    date: new Date("2024-08-15"),
    address: {
      street: "Techweg",
      houseNumber: "3",
      city: "München",
      postalCode: "80331",
      country: "Deutschland",
    },
    thumbnail: "/pexels-hitesh-choudhary-693859.jpg",
  };

  const event4: eventResource = {
    name: "Yoga im Park",
    description: "Entspannende Yoga-Sessions im Freien für alle Niveaus.",
    price: 15,
    date: new Date("2024-05-25"),
    address: {
      street: "Grünallee",
      houseNumber: "2",
      city: "Köln",
      postalCode: "50678",
      country: "Deutschland",
    },
    hashtags: ["yoga", "relaxation", "outdoor"],
    participants: [jane.id, emily.id, charlie.id, john.id],
    thumbnail: "/pexels-vlada-karpovich-8940499.jpg",
  };

  const event5: eventResource = {
    name: "Kunstausstellung Modern Art",
    description: "Entdecken Sie moderne Kunstwerke lokaler Künstler.",
    price: 20,
    date: new Date("2024-09-30"),
    address: {
      street: "Künstlerstraße",
      houseNumber: "4",
      city: "Frankfurt",
      postalCode: "60311",
      country: "Deutschland",
    },
    category: [category2],
    hashtags: ["art", "exhibition", "modernart"],
    participants: [alice.id, tom.id, olivia.id, emily.id, john.id],
    thumbnail: "/pexels-steve-johnson-1672850.jpg",
  };

  const event6: eventResource = {
    name: "Science Fiction Convention",
    description: "Tauchen Sie ein in die Welt der Science Fiction und Fantasy.",
    price: 30,
    date: new Date("2024-11-20"),
    address: {
      street: "Sci-Fi-Platz",
      houseNumber: "9",
      city: "Düsseldorf",
      postalCode: "40213",
      country: "Deutschland",
    },
    category: [categories[3]], // Gaming
    hashtags: ["scifi", "fantasy", "convention"],
    participants: [bob.id, tom.id, emily.id, olivia.id],
    thumbnail: "/pexels-craig-adderley-3526022.jpg",
  };

  const event7: eventResource = {
    name: "Fashion Show",
    description: "Die neuesten Modetrends von renommierten Designern.",
    price: 20,
    date: new Date("2024-12-05"),
    address: {
      street: "Fashionstraße",
      houseNumber: "12",
      city: "Hannover",
      postalCode: "30159",
      country: "Deutschland",
    },
    category: [categories[6]], // Social
    hashtags: ["fashion", "style", "trends"],
    participants: [alice.id, charlie.id, emily.id, olivia.id],
    thumbnail: "/pexels-helder-14577493.jpg",
  };

  const event9: eventResource = {
    name: "Film Festival",
    description: "Eine Auswahl von herausragenden Filmen aus aller Welt.",
    price: 35,
    date: new Date("2025-02-10"),
    address: {
      street: "Filmweg",
      houseNumber: "18",
      city: "Münster",
      postalCode: "48143",
      country: "Deutschland",
    },
    category: [categories[4], categories[0]], // Hobbys, Kultur & Kunst
    hashtags: ["tech", "conference", "innovation"],
    participants: [alice.id, emily.id, john.id, tom.id],
    thumbnail: "/pexels-martin-lopez-1117132.jpg",
  };

  const event10: eventResource = {
    name: "Running Challenge",
    description: "Laufherausforderung für alle Laufbegeisterten.",
    price: 0,
    date: new Date("2024-07-20"),
    address: {
      street: "Laufstraße",
      houseNumber: "15",
      city: "Leipzig",
      postalCode: "04103",
      country: "Deutschland",
    },
    category: [categories[2], categories[5]], // Sport & Fitness, Outdoor
    hashtags: ["running", "challenge", "fitness"],
    participants: [tom.id, charlie.id, emily.id],
    thumbnail: "/pexels-run-ffwpu-1571939.jpg",
  };

  const event11: eventResource = {
    name: "Photography Workshop",
    description:
      "Workshop für angehende Fotografen zum Erlernen neuer Techniken.",
    price: 15,
    date: new Date("2024-06-10"),
    address: {
      street: "Fotografenallee",
      houseNumber: "12",
      city: "Hannover",
      postalCode: "30159",
      country: "Deutschland",
    },
    category: [categories[4], categories[0]], // Hobbys, Kultur & Kunst
    hashtags: ["photography", "workshop", "creative"],
    participants: [tom.id, emily.id, olivia.id],
    thumbnail: "/pexels-zukiman-mohamad-22185.jpg",
  };

  const event12: eventResource = {
    name: "Social Meetup",
    description: "Gemütliches Treffen zum Kennenlernen und Austauschen.",
    price: 0,
    date: new Date("2024-08-30"),
    address: {
      street: "Socialplatz",
      houseNumber: "9",
      city: "Stuttgart",
      postalCode: "70173",
      country: "Deutschland",
    },
    category: [categories[6]], // Social
    hashtags: ["social", "meetup", "community"],
    participants: [charlie.id, emily.id, olivia.id, tom.id],
    thumbnail: "/pexels-dani-hart-3719037.jpg",
  };

  const event15: eventResource = {
    name: "Board Game Night",
    description: "Gemeinsamer Spieleabend mit einer Vielzahl von Brettspielen.",
    price: 10,
    date: new Date("2024-09-15"),
    address: {
      street: "Spielplatz",
      houseNumber: "18",
      city: "Nürnberg",
      postalCode: "90403",
      country: "Deutschland",
    },
    category: [categories[4]], // Hobbys
    thumbnail: "/pexels-cottonbro-studio-4691567.jpg",
  };

  const event16: eventResource = {
    name: "Berlin Exploration",
    description:
      "Entdecken Sie die faszinierende Stadt Berlin bei einer aufregenden Erkundungstour. Besichtigen Sie historische Sehenswürdigkeiten, erleben Sie die lebendige Kultur und probieren Sie lokale Köstlichkeiten.",
    price: 15,
    date: new Date("2024-09-25"),
    address: {
      street: "Berlinstraße",
      houseNumber: "10",
      city: "Berlin",
      postalCode: "10178",
      country: "Deutschland",
    },
    category: [categories[6]], // Social
    hashtags: ["exploration", "Berlin", "history", "culture"],
    participants: ["Tom Brown", "Emily Wilson", "Sam Miller", "Olivia Davis"],
    thumbnail: "/pexels-niki-nagy-1128408.jpg",
  };

  const event17: eventResource = {
    name: "Hiking Expedition",
    description:
      "Erkunden Sie die Schönheit der Natur bei einer aufregenden Wandertour. Unsere Wanderexperten führen Sie durch malerische Landschaften und sorgen für ein unvergessliches Naturerlebnis.",
    price: 10,
    date: new Date("2024-09-05"),
    address: {
      street: "Wanderweg",
      houseNumber: "3",
      city: "Stuttgart",
      postalCode: "70174",
      country: "Deutschland",
    },
    category: [categories[5]], // Outdoor
    hashtags: ["hiking", "nature", "expedition"],
    participants: [alice.id, tom.id, emily.id],
    thumbnail: "/pexels-eric-sanman-1365425.jpg",
  };

  const event18: eventResource = {
    name: "Cooking Class",
    description:
      "Nehmen Sie an unserer exklusiven Kochklasse teil und lernen Sie von einem erstklassigen Profikoch. Entdecken Sie die Geheimnisse der kulinarischen Welt und zaubern Sie köstliche Gerichte in Ihrer eigenen Küche.",
    price: 30,
    date: new Date("2024-11-08"),
    address: {
      street: "Kochschule",
      houseNumber: "15",
      city: "Frankfurt",
      postalCode: "60313",
      country: "Deutschland",
    },
    category: [categories[1]],
    hashtags: ["cooking", "culinary", "class"],
    participants: [john.id, jane.id, olivia.id],
    thumbnail: "/pexels-maarten-van-den-heuvel-2284166.jpg",
  };

  const event20: eventResource = {
    name: "Connect & Explore",
    description:
      "Connect & Explore ist ein innovatives Projekt, das darauf ausgerichtet ist, in einer zunehmend digital vernetzten Welt Menschen miteinander zu verbinden und ihnen die Möglichkeit zu geben, faszinierende Veranstaltungen und Erlebnisse in ihrer Stadt zu entdecken.",
    price: 10,
    date: new Date("2024-01-25"),
    address: {
      street: "Luxemburger Straße",
      houseNumber: "10",
      city: "Berlin",
      postalCode: "13353",
      country: "Deutschland",
    },
    category: [categories[5]], // Outdoor
    hashtags: ["Tech", "Livepräsentation"],
    thumbnail: "/FOOTER_LOGO.png",
    participants: [
      alice.id,
      tom.id,
      emily.id,
      john.id,
      jane.id,
      bob.id,
      charlie.id,
      emily.id,
      olivia.id,
    ],
  };

  await EventService.createEvent(event1, john.id);
  await EventService.createEvent(event2, john.id);
  await EventService.createEvent(event3, john.id);
  await EventService.createEvent(event16, john.id);
  await EventService.createEvent(event20, john.id);
  await EventService.createEvent(event17, jane.id);
  await EventService.createEvent(event4, jane.id);
  await EventService.createEvent(event5, jane.id);
  await EventService.createEvent(event6, bob.id);
  await EventService.createEvent(event7, alice.id);
  await EventService.createEvent(event9, tom.id);
  await EventService.createEvent(event10, tom.id);
  await EventService.createEvent(event11, tom.id);
  await EventService.createEvent(event12, charlie.id);
  await EventService.createEvent(event18, emily.id);
  await EventService.createEvent(event15, olivia.id);
};

export default createTestData;

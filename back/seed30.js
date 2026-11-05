const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./src/models/Product');

dotenv.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/clothes-store';

const products = [
  {
    name: "هودي 'ظل المدينة' السايبربانك",
    description: "هودي مستقبلي يعكس ثقافة السايبربانك مع إضاءة نيون خفيفة مدمجة وتصميم قماشي مقاوم للماء. يجعلك تبدو وكأنك خارج من عام 2077.",
    price: 320,
    originalPrice: 400,
    category: "cyberpunk",
    subcategory: "hoodies",
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    sizes: ["M", "L", "XL"],
    colors: ["#000000", "#00FF00"],
    inStock: true,
    rating: 4.9,
    numReviews: 87,
    isNewProduct: true,
    isFeatured: true
  },
  {
    name: "فستان 'أزهار البوهو' المتطاير",
    description: "فستان بوهيمي طويل من الكتان الطبيعي المزخرف بتطريزات يدوية ونقوش زهور رقيقة. يعطيكِ إحساساً بالحرية المطلقة والتناغم مع الطبيعة.",
    price: 450,
    category: "bohemian",
    subcategory: "dresses",
    image: "https://images.unsplash.com/photo-1515347619362-67347cb022b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    sizes: ["S", "M", "L"],
    colors: ["#F5DEB3", "#FFF8DC"],
    inStock: true,
    rating: 4.7,
    numReviews: 42,
    isFeatured: true
  },
  {
    name: "جاكيت 'الدرع الحضري' التقني",
    description: "جاكيت تيك-وير (Techwear) مزود بـ 12 جيب مخفي، مصنوع من ألياف كيفلار المرنة وخامات تمنع تسرب الرياح. الأناقة تلتقي بالتكتيك العسكري.",
    price: 890,
    originalPrice: 1100,
    category: "techwear",
    subcategory: "jackets",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    sizes: ["L", "XL", "XXL"],
    colors: ["#1C1C1C"],
    inStock: true,
    rating: 4.8,
    isSale: true
  },
  {
    name: "تيشيرت 'نقاء التفاصيل' المينيماليست",
    description: "أحياناً الجمال يكمن في البساطة. تيشيرت قطني فاخر بلا أي شعارات، بقصة هندسية دقيقة تبرز تفاصيل الجسم بأناقة هادئة.",
    price: 180,
    category: "minimalist",
    subcategory: "t-shirts",
    image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    sizes: ["S", "M", "L", "XL"],
    colors: ["#FFFFFF", "#F5F5F5"],
    inStock: true,
    rating: 4.6
  },
  {
    name: "معطف 'لغز منتصف الليل' القوطي",
    description: "معطف شتوي طويل بتفاصيل دانتيل أسود يحيط بالأطراف، مع أزرار معدنية عتيقة. لمحبي الطراز القوطي الغامض والأناقة الساحرة.",
    price: 650,
    category: "gothic",
    subcategory: "outerwear",
    image: "https://images.unsplash.com/photo-1550541913-c399ea489379?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    sizes: ["M", "L"],
    colors: ["#000000", "#4B0082"],
    inStock: true,
    rating: 4.9
  },
  {
    name: "قميص 'الفن الحضري' لملابس الشارع",
    description: "قميص أوفر-سايز مستوحى من جداريات نيويورك ورسومات الجرافيتي العشوائية. صُنع ليعبر عن ثقافة الشارع المتمردة والمنطلقة.",
    price: 240,
    category: "streetwear",
    subcategory: "shirts",
    image: "https://images.unsplash.com/photo-1523398002811-999aa8e9f5b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["#FF4500", "#000000"],
    inStock: true,
    rating: 4.7,
    isNewProduct: true
  },
  {
    name: "بليزر 'العبقري الأنيق' الذكي",
    description: "بليزر كاجوال ذكي مصنوع من صوف خفيف لا يتجعد. مثالي للاجتماعات المفاجئة أو عشاء راقٍ دون الشعور بالتكلف.",
    price: 520,
    category: "smart-casual",
    subcategory: "blazers",
    image: "https://images.unsplash.com/photo-1594938291221-94f18cbb5660?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    sizes: ["48", "50", "52", "54"],
    colors: ["#2F4F4F", "#708090"],
    inStock: true,
    rating: 4.8
  },
  {
    name: "حذاء 'خطوات الأرض' صديق البيئة",
    description: "حذاء رياضي مصنوع بالكامل من بلاستيك المحيطات المُعاد تدويره وألياف الأناناس. كن أنيقاً وأنقذ الكوكب في نفس الوقت.",
    price: 390,
    originalPrice: 450,
    category: "eco-friendly",
    subcategory: "footwear",
    image: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    sizes: ["40", "41", "42", "43", "44", "45"],
    colors: ["#228B22", "#D2B48C"],
    inStock: true,
    rating: 5.0,
    isSale: true
  },
  {
    name: "نظارات 'رؤية المستقبل' الريترو",
    description: "نظارات شمسية بإطار عريض مستوحى من حقبة الثمانينات، مع عدسات تعكس ألوان الغروب. أضف لمسة حنين راقية لإطلالتك.",
    price: 150,
    category: "retro-80s",
    subcategory: "accessories",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    sizes: ["One Size"],
    colors: ["#FFD700", "#FF1493"],
    inStock: true,
    rating: 4.6
  },
  {
    name: "طقم 'طاقة بلا حدود' الرياضي",
    description: "ملابس أكتيف-وير مصممة بتقنية طرد العرق والتبريد الذاتي. ستشعر بالنشاط والطاقة سواء كنت في الجيم أو تركض في الماراثون.",
    price: 280,
    category: "activewear",
    subcategory: "sets",
    image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    sizes: ["S", "M", "L"],
    colors: ["#FF0000", "#000000"],
    inStock: true,
    rating: 4.8
  },
  {
    name: "فستان 'تحفة السجادة الحمراء' الراقي",
    description: "أزياء راقية (Haute Couture) مصممة خصيصاً لتجعلكِ نجمة الحفل. قماش حريري ينسدل كالموج مع كريستالات صغيرة تخطف الأضواء.",
    price: 2500,
    category: "haute-couture",
    subcategory: "dresses",
    image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    sizes: ["S", "M"],
    colors: ["#800000", "#C0C0C0"],
    inStock: true,
    rating: 5.0,
    isFeatured: true
  },
  {
    name: "كنزة 'سحابة القطن' المريحة",
    description: "ملابس منزل (Loungewear) لا تود خلعها أبداً. ناعمة كالسحاب ومثالية لجلسات القهوة الصباحية وقراءة الكتب في الشتاء.",
    price: 210,
    category: "loungewear",
    subcategory: "sweaters",
    image: "https://images.unsplash.com/photo-1434389678369-e840d21b3696?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    sizes: ["M", "L", "XL"],
    colors: ["#E6E6FA", "#FFF0F5"],
    inStock: true,
    rating: 4.9
  },
  {
    name: "ساعة 'المجرة' الفاخرة",
    description: "ساعة يد ميكانيكية شفافة تكشف عن تروسها الداخلية، المينا مزينة بحجر النيزك الحقيقي. ليست مجرد ساعة، بل قطعة من الفضاء.",
    price: 3200,
    category: "luxury-watches",
    subcategory: "watches",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    sizes: ["One Size"],
    colors: ["#C0C0C0", "#000000"],
    inStock: true,
    rating: 5.0
  },
  {
    name: "حقيبة 'عبق التاريخ' الفينتاج",
    description: "حقيبة جلدية أصلية بتصميم كلاسيكي من الخمسينات، يزداد جمالها مع مرور الزمن لتروي حكايات الماضي بأناقة الحاضر.",
    price: 580,
    category: "vintage",
    subcategory: "bags",
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    sizes: ["One Size"],
    colors: ["#8B4513", "#A0522D"],
    inStock: true,
    rating: 4.7
  },
  {
    name: "بدلة 'النجاح المطلق' للعمل",
    description: "بدلة مكتبية تجمع بين القوة والنعومة، صممت خصيصاً لسيدات الأعمال اللواتي يصنعن القرار بثقة وأناقة لا مثيل لها.",
    price: 850,
    originalPrice: 1000,
    category: "office-wear",
    subcategory: "suits",
    image: "https://images.unsplash.com/photo-1548624149-a1b6a37825eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    sizes: ["36", "38", "40", "42"],
    colors: ["#000080", "#000000"],
    inStock: true,
    rating: 4.8,
    isSale: true
  },
  {
    name: "فستان 'احتضان الحياة' للحوامل",
    description: "مصمم بحب ليتمدد بنعومة مع تغيرات جسدكِ، قماش مطاطي مسامي يوفر لكِ أقصى درجات الراحة دون التنازل عن إطلالتك الأنثوية.",
    price: 340,
    category: "maternity",
    subcategory: "dresses",
    image: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["#FFB6C1", "#ADD8E6"],
    inStock: true,
    rating: 4.9
  },
  {
    name: "قميص 'الثقة الجذابة' المقاسات الكبيرة",
    description: "الأناقة لا تعرف مقاساً. قميص مصمم بذكاء ليبرز جمال القوام الممتلئ بقصات استراتيجية وأقمشة فاخرة تنسدل بانسيابية.",
    price: 220,
    category: "plus-size",
    subcategory: "shirts",
    image: "https://images.unsplash.com/photo-1622290319146-7b63df48a635?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    sizes: ["XL", "XXL", "3XL", "4XL"],
    colors: ["#800080", "#000000"],
    inStock: true,
    rating: 4.7
  },
  {
    name: "شورت 'نسيم البحر' الصيفي",
    description: "شورت خفيف بنقوش استوائية زاهية، مثالي لحفلات الشواء الصيفية والمشي حافي القدمين على رمال الشاطئ الذهبية.",
    price: 130,
    category: "summer-vibes",
    subcategory: "shorts",
    image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    sizes: ["S", "M", "L"],
    colors: ["#00FFFF", "#FFFF00"],
    inStock: true,
    rating: 4.5
  },
  {
    name: "وشاح 'دفء الثلج' الشتوي",
    description: "وشاح سميك من صوف الألبكة الخالص، يلتف حول عنقك كعناق دافئ في أبرد ليالي الشتاء القارسة.",
    price: 190,
    category: "winter-essentials",
    subcategory: "accessories",
    image: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    sizes: ["One Size"],
    colors: ["#A9A9A9", "#FFFFFF"],
    inStock: true,
    rating: 4.8
  },
  {
    name: "فستان 'بريق الديسكو' للسهرات",
    description: "مغطى بالترتر اللامع الذي يعكس كل ضوء في الغرفة. عندما ترتدين هذا الفستان، ستكونين أنتِ الحفلة بحد ذاتها.",
    price: 490,
    category: "party-wear",
    subcategory: "dresses",
    image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    sizes: ["XS", "S", "M"],
    colors: ["#FFD700", "#C0C0C0"],
    inStock: true,
    rating: 4.7
  },
  {
    name: "جاكيت 'جنون الكوتشيلا' للمهرجانات",
    description: "جاكيت جينز مزين بالشراشيب الجلدية والرقع الملونة. صُمم خصيصاً للرقص تحت أشعة الشمس في أضخم المهرجانات الموسيقية.",
    price: 360,
    category: "festival-outfits",
    subcategory: "jackets",
    image: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    sizes: ["M", "L"],
    colors: ["#1E90FF", "#FF69B4"],
    inStock: true,
    rating: 4.6
  },
  {
    name: "بنطلون 'الأسطورة الخالدة' الدنيم",
    description: "جينز أصلي بلمسة غسيل حجري مميزة وتمزقات استراتيجية. كلما ارتديته أكثر، كلما أصبح شكله أروع وأكثر تعبيراً عن شخصيتك.",
    price: 270,
    category: "denim-collection",
    subcategory: "pants",
    image: "https://images.unsplash.com/photo-1542272604-780026e632db?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    sizes: ["30", "32", "34", "36"],
    colors: ["#000080", "#87CEEB"],
    inStock: true,
    rating: 4.8
  },
  {
    name: "محفظة 'الزمن الأصيل' الجلدية",
    description: "صُنعت يدوياً من جلد البقر الطبيعي المُعتق. تفوح منها رائحة الفخامة وتتميز بمتانة تتوارثها الأجيال.",
    price: 180,
    category: "leather-goods",
    subcategory: "accessories",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    sizes: ["One Size"],
    colors: ["#8B4513"],
    inStock: true,
    rating: 4.9
  },
  {
    name: "قميص 'أوراق الغابة' المستدام",
    description: "قميص ناعم الملمس مصنوع بالكامل من ألياف الخيزران العضوية. بارد على البشرة ولطيف على الطبيعة الأم.",
    price: 210,
    category: "sustainable-fashion",
    subcategory: "shirts",
    image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    sizes: ["S", "M", "L", "XL"],
    colors: ["#556B2F", "#F5DEB3"],
    inStock: true,
    rating: 4.7
  },
  {
    name: "سنيكرز 'إصدار الشوارع المحدود'",
    description: "حذاء أيقوني يجمع عشاق جمع الأحذية (Sneakerheads). تصميم جرئ يكسر قواعد الجاذبية بألوان نيون نابضة بالحياة.",
    price: 1500,
    originalPrice: 1800,
    category: "sneakerhead",
    subcategory: "footwear",
    image: "https://images.unsplash.com/photo-1552346154-21d32810baa3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    sizes: ["42", "43", "44"],
    colors: ["#FF00FF", "#00FFFF"],
    inStock: true,
    rating: 5.0,
    isSale: true
  },
  {
    name: "عقد 'دموع القمر' البارز",
    description: "قطعة مجوهرات ضخمة (Statement) من اللؤلؤ الأسود النادر والفضة الاسترلينية. مُصممة لتكون محور الانتباه في أي إطلالة.",
    price: 890,
    category: "statement-jewelry",
    subcategory: "accessories",
    image: "https://images.unsplash.com/photo-1599643478514-4a42092176d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    sizes: ["One Size"],
    colors: ["#000000", "#C0C0C0"],
    inStock: true,
    rating: 4.8
  },
  {
    name: "رداء 'أمواج المالديف' للشاطئ",
    description: "كيمونو شاطئي شفاف مزين بنقوش صدفية دقيقة. يتمايل مع نسيم البحر ليمنحكِ إطلالة حورية عصرية.",
    price: 230,
    category: "beachwear",
    subcategory: "coverups",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb0d9e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    sizes: ["Free Size"],
    colors: ["#E0FFFF", "#FFFFFF"],
    inStock: true,
    rating: 4.7
  },
  {
    name: "بيجاما 'أحلام الحرير' الليلية",
    description: "طقم نوم من الحرير الطبيعي 100%. ينزلق على البشرة بنعومة فائقة ليضمن لك نوماً عميقاً وأحلاماً وردية مليئة بالرفاهية.",
    price: 450,
    category: "sleepwear",
    subcategory: "sets",
    image: "https://images.unsplash.com/photo-1581005527237-775b06456f4d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    sizes: ["S", "M", "L"],
    colors: ["#FFC0CB", "#000000"],
    inStock: true,
    rating: 4.9
  },
  {
    name: "فستان 'أسطورة الحب' للزفاف",
    description: "تحفة فنية للعروس الحالمة. طبقات من التول الفرنسي والدانتيل المطرز يدوياً ليجعل يوم زفافك قصة خيالية لا تُنسى.",
    price: 8500,
    category: "bridal",
    subcategory: "dresses",
    image: "https://images.unsplash.com/photo-1595963953504-22b9187e14a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    sizes: ["Custom Fit"],
    colors: ["#FFFFFF", "#FDF5E6"],
    inStock: true,
    rating: 5.0,
    isFeatured: true
  },
  {
    name: "سويت شيرت 'ديناميكية الحركة' الأثليجر",
    description: "يجمع بين أناقة الكاجوال وراحة الملابس الرياضية (Athleisure). مثالي للانطلاق من النادي الرياضي إلى مقهى الأصدقاء بثقة تامة.",
    price: 260,
    category: "athleisure",
    subcategory: "hoodies",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    sizes: ["M", "L", "XL"],
    colors: ["#808080", "#000000"],
    inStock: true,
    rating: 4.6
  }
];

const seedDB = async () => {
  try {
    console.log("Connecting to Database...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected Successfully.");

    console.log("Inserting 30 creative products...");
    await Product.insertMany(products);

    console.log("30 Creative products and categories added successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDB();

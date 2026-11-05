const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./src/models/Product');

dotenv.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/clothes-store';

const pexelsIds = [
  298863, 1036622, 1183266, 1926769, 994234, 842811, 934070, 1462637, 
  1656684, 2836486, 1852382, 2703202, 2064359, 1126993, 245388, 1374910, 
  994523, 1043474, 297933, 3748221, 2905828, 1884581, 1036623, 1926768, 
  934069, 298864, 298865, 1852381, 1036625, 298866
];

const getPexelsUrl = (index) => `https://images.pexels.com/photos/${pexelsIds[index]}/pexels-photo-${pexelsIds[index]}.jpeg?auto=compress&cs=tinysrgb&w=800`;

const products = [
  {
    name: "هودي 'ظل المدينة' السايبربانك",
    description: "هودي مستقبلي يعكس ثقافة السايبربانك مع إضاءة نيون خفيفة مدمجة وتصميم قماشي مقاوم للماء. يجعلك تبدو وكأنك خارج من عام 2077.",
    price: 320,
    originalPrice: 400,
    category: "cyberpunk",
    subcategory: "hoodies",
    image: getPexelsUrl(0),
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
    image: getPexelsUrl(1),
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
    image: getPexelsUrl(2),
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
    image: getPexelsUrl(3),
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
    image: getPexelsUrl(4),
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
    image: getPexelsUrl(5),
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
    image: getPexelsUrl(6),
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
    image: getPexelsUrl(7),
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
    image: getPexelsUrl(8),
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
    image: getPexelsUrl(9),
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
    image: getPexelsUrl(10),
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
    image: getPexelsUrl(11),
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
    image: getPexelsUrl(12),
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
    image: getPexelsUrl(13),
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
    image: getPexelsUrl(14),
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
    image: getPexelsUrl(15),
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
    image: getPexelsUrl(16),
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
    image: getPexelsUrl(17),
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
    image: getPexelsUrl(18),
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
    image: getPexelsUrl(19),
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
    image: getPexelsUrl(20),
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
    image: getPexelsUrl(21),
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
    image: getPexelsUrl(22),
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
    image: getPexelsUrl(23),
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
    image: getPexelsUrl(24),
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
    image: getPexelsUrl(25),
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
    image: getPexelsUrl(26),
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
    image: getPexelsUrl(27),
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
    image: getPexelsUrl(28),
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
    image: getPexelsUrl(29),
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

    console.log("Deleting old products...");
    const result = await Product.deleteMany({});
    console.log(`Deleted ${result.deletedCount} old products.`);

    console.log("Inserting 30 creative products with Pexels images...");
    await Product.insertMany(products);

    console.log("30 Creative products added successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDB();

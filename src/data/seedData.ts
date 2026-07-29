import { AppState } from '../types';

export const initialSeedData: AppState = {
  isLoggedIn: true,
  currentUser: {
    id: 'usr-1',
    username: 'admin',
    name: 'سارة المنصوري',
    password: 'admin',
    role: 'مدير المكتب'
  },
  settings: {
    officeName: 'إماراتك العقارية',
    officeLogo: 'إماراتك العقارية',
    logoUrl: '',
    phone: '+971 6 740 0000',
    email: 'emaratekrealestate@gmail.com',
    address: 'عجمان - الجرف - دوار ماكدونالدز',
    bankAccountDetails: 'مصرف عجمان - IBAN: AE390240001020304050607',
    taxNumber: '100482938100003',
    printHeaderNote: 'إماراتك العقارية - EMARATEK REAL ESTATE | عجمان - الجرف - دوار ماكدونالدز',
    expenseCategories: [
      'إيجار المكتب',
      'كهرباء ومياه',
      'تسويق وإعلانات',
      'رواتب ومكافآت',
      'أدوات ومستلزمات مكتبية',
      'رسوم حكومية وترخيص',
      'صيانة وضيافة',
      'اتصالات وإنترنت',
      'أخرى'
    ],
    revenueTypes: [
      'عمولة بيع وشراء',
      'عمولة تأجير',
      'رسوم إدارة أملاك',
      'رسوم خدمات وإعادة عقد',
      'استشارات عقارية',
      'أخرى'
    ],
    employees: [
      'أحمد المنصوري',
      'محمد العتيبي',
      'سارة الشامسي',
      'عبدالله الحمادي',
      'يوسف الزهراني'
    ],
    buildings: [
      'بناية الريم',
      'برج الياسمين',
      'مجمع الواحة السكني',
      'بناية الخالدية',
      'مركز زايد التجاري'
    ],
    unitTypes: [
      'شقة سكنية',
      'محل تجاري',
      'مكتب إداري',
      'فيلا مستقلة',
      'معرض تجاري',
      'مستودع',
      'استوديو',
      'ملحق',
      'أرض'
    ],
    buildingDetails: [
      {
        id: 'bldg-1',
        name: 'بناية الريم',
        floorsCount: 3,
        unitsPerFloor: 4,
        units: [
          { id: 'u-101', unitNumber: 'شقة 101', unitType: 'شقة سكنية', floorNumber: 1 },
          { id: 'u-102', unitNumber: 'شقة 102', unitType: 'شقة سكنية', floorNumber: 1 },
          { id: 'u-201', unitNumber: 'شقة 201', unitType: 'شقة سكنية', floorNumber: 2 },
          { id: 'u-202', unitNumber: 'شقة 202', unitType: 'شقة سكنية', floorNumber: 2 },
          { id: 'u-301', unitNumber: 'شقة 301', unitType: 'شقة سكنية', floorNumber: 3 },
          { id: 'u-302', unitNumber: 'شقة 302', unitType: 'شقة سكنية', floorNumber: 3 }
        ]
      },
      {
        id: 'bldg-2',
        name: 'برج الياسمين',
        floorsCount: 5,
        unitsPerFloor: 2,
        units: [
          { id: 'u-y1', unitNumber: 'مكتب 101', unitType: 'مكتب إداري', floorNumber: 1 },
          { id: 'u-y2', unitNumber: 'مكتب 102', unitType: 'مكتب إداري', floorNumber: 1 },
          { id: 'u-y3', unitNumber: 'مكتب 201', unitType: 'مكتب إداري', floorNumber: 2 }
        ]
      }
    ],
    users: [
      { id: 'usr-1', username: 'admin', name: 'المدير العام', role: 'مدير النظام' },
      { id: 'usr-2', username: 'ahmed', name: 'أحمد المنصوري', role: 'وسيط عقاري' },
      { id: 'usr-3', username: 'accountant', name: 'محاسب المكتب', role: 'محاسب' }
    ]
  },

  expenses: [
    {
      id: 'exp-101',
      amount: 15000,
      details: 'دفعة إيجار المكتب الشهري',
      date: '2026-07-01',
      category: 'إيجار المكتب',
      paymentMethod: 'تحويل بنكي',
      responsible: 'أحمد المنصوري',
      notes: 'تم التحويل لحساب المالك الرئيسي',
      reference: 'TRX-8829'
    },
    {
      id: 'exp-102',
      amount: 1850,
      details: 'فاتورة الكهرباء والماء لشهر يونيو',
      date: '2026-07-05',
      category: 'كهرباء ومياه',
      paymentMethod: 'بطاقة',
      responsible: 'سارة الشامسي',
      notes: 'دفع إلكتروني عبر موقع الهيئة',
      reference: 'DEWA-9402'
    },
    {
      id: 'exp-103',
      amount: 4500,
      details: 'حملة إعلانية على منصات عقارية وفيسبوك',
      date: '2026-07-10',
      category: 'تسويق وإعلانات',
      paymentMethod: 'بطاقة',
      responsible: 'محمد العتيبي',
      notes: 'تسويق مشروع شقق الواحة',
      reference: 'FB-ADS-22'
    },
    {
      id: 'exp-104',
      amount: 850,
      details: 'ضيافة ومشروبات للمكتب ومستلزمات نظافة',
      date: '2026-07-15',
      category: 'صيانة وضيافة',
      paymentMethod: 'نقد',
      responsible: 'عبدالله الحمادي',
      notes: 'فاتورة السوبرماركت والمورد',
      reference: 'INV-1029'
    },
    {
      id: 'exp-105',
      amount: 1200,
      details: 'فاتورة الإنترنت السريع والخطوط الثابتة',
      date: '2026-07-18',
      category: 'اتصالات وإنترنت',
      paymentMethod: 'تحويل بنكي',
      responsible: 'سارة الشامسي',
      notes: 'اتصالات الإمارات',
      reference: 'ET-9941'
    }
  ],

  revenues: [
    {
      id: 'rev-201',
      employeeName: 'أحمد المنصوري',
      date: '2026-07-02',
      amount: 25000,
      type: 'عمولة بيع وشراء',
      details: 'عمولة بيع فيلا رقم 14 في مجمع الواحة',
      notes: 'عمولة المشتري بنسبة 2%'
    },
    {
      id: 'rev-202',
      employeeName: 'محمد العتيبي',
      date: '2026-07-08',
      amount: 3500,
      type: 'عمولة تأجير',
      details: 'تأجير شقة 402 بناية الريم للمستأجر خالد الجاسم',
      notes: 'عمولة تأجير سنوية 5%'
    },
    {
      id: 'rev-203',
      employeeName: 'سارة الشامسي',
      date: '2026-07-12',
      amount: 1500,
      type: 'رسوم خدمات وإعادة عقد',
      details: 'رسوم تجديد عقد وشبكة عقارية شقة 108',
      notes: 'رسوم إدارية نقدية'
    },
    {
      id: 'rev-204',
      employeeName: 'عبدالله الحمادي',
      date: '2026-07-20',
      amount: 18000,
      type: 'رسوم إدارة أملاك',
      details: 'رسوم إدارة بناية الخالدية للربع الثالث',
      notes: 'عقد إدارة أملاك سنوي'
    }
  ],

  contracts: [
    {
      id: 'cnt-1',
      buildingName: 'بناية الريم',
      area: 'الروضة - دبي',
      unitNumber: 'شقة 302',
      unitType: 'شقة سكنية (غرفتين وصالة)',
      ownerName: 'سليمان الفاسي',
      tenantName: 'خالد عبدالملك الجاسم',
      tenantPhone: '+971 50 123 4567',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      annualRent: 60000,
      installmentsCount: 4,
      securityDeposit: 3000,
      paymentType: 'شيك',
      notes: 'العقد يتجدد تلقائياً بالتوافق، الشيكات لدى الخزينة',
      status: 'نشط',
      installments: [
        {
          id: 'inst-1-1',
          contractId: 'cnt-1',
          installmentNo: 1,
          dueDate: '2026-01-01',
          amount: 15000,
          chequeNumber: 'CHK-9011',
          bankName: 'بنك دبي الإسلامي',
          status: 'محصل',
          collectedDate: '2026-01-02',
          paymentMethod: 'شيك'
        },
        {
          id: 'inst-1-2',
          contractId: 'cnt-1',
          installmentNo: 2,
          dueDate: '2026-04-01',
          amount: 15000,
          chequeNumber: 'CHK-9012',
          bankName: 'بنك دبي الإسلامي',
          status: 'محصل',
          collectedDate: '2026-04-03',
          paymentMethod: 'شيك'
        },
        {
          id: 'inst-1-3',
          contractId: 'cnt-1',
          installmentNo: 3,
          dueDate: '2026-07-01',
          amount: 15000,
          chequeNumber: 'CHK-9013',
          bankName: 'بنك دبي الإسلامي',
          status: 'غير محصل',
          notes: 'استحقاق الجاري - تم التواصل مع المستأجر'
        },
        {
          id: 'inst-1-4',
          contractId: 'cnt-1',
          installmentNo: 4,
          dueDate: '2026-10-01',
          amount: 15000,
          chequeNumber: 'CHK-9014',
          bankName: 'بنك دبي الإسلامي',
          status: 'غير محصل'
        }
      ]
    },
    {
      id: 'cnt-2',
      buildingName: 'مركز زايد التجاري',
      area: 'وسط المدينة',
      unitNumber: 'محل 12',
      unitType: 'محل تجاري',
      ownerName: 'مؤسسة الساحل للحقوق',
      tenantName: 'شركة النور للمقاهي والمطاعم',
      tenantPhone: '+971 55 987 6543',
      startDate: '2025-09-01',
      endDate: '2026-08-31',
      annualRent: 120000,
      installmentsCount: 4,
      securityDeposit: 10000,
      paymentType: 'شيك',
      notes: 'عقد تجاري ينتهي خلال أقل من 60 يوماً - تذكير التجديد',
      status: 'نشط',
      installments: [
        {
          id: 'inst-2-1',
          contractId: 'cnt-2',
          installmentNo: 1,
          dueDate: '2025-09-01',
          amount: 30000,
          chequeNumber: 'CHK-5501',
          bankName: 'بنك الإمارات دبي الوطني',
          status: 'محصل',
          collectedDate: '2025-09-02'
        },
        {
          id: 'inst-2-2',
          contractId: 'cnt-2',
          installmentNo: 2,
          dueDate: '2025-12-01',
          amount: 30000,
          chequeNumber: 'CHK-5502',
          bankName: 'بنك الإمارات دبي الوطني',
          status: 'محصل',
          collectedDate: '2025-12-01'
        },
        {
          id: 'inst-2-3',
          contractId: 'cnt-2',
          installmentNo: 3,
          dueDate: '2026-03-01',
          amount: 30000,
          chequeNumber: 'CHK-5503',
          bankName: 'بنك الإمارات دبي الوطني',
          status: 'محصل',
          collectedDate: '2026-03-02'
        },
        {
          id: 'inst-2-4',
          contractId: 'cnt-2',
          installmentNo: 4,
          dueDate: '2026-06-01',
          amount: 30000,
          chequeNumber: 'CHK-5504',
          bankName: 'بنك الإمارات دبي الوطني',
          status: 'غير محصل',
          notes: 'دفعة متأخرة منذ شهر يونيو'
        }
      ]
    },
    {
      id: 'cnt-3',
      buildingName: 'برج الياسمين',
      area: 'الخليج التجاري',
      unitNumber: 'مكتب 1405',
      unitType: 'مكتب إداري',
      ownerName: 'عبدالرحمن العلي',
      tenantName: 'مؤسسة الفجر للحلول البرمجية',
      tenantPhone: '+971 52 444 3322',
      startDate: '2026-03-01',
      endDate: '2027-02-28',
      annualRent: 80000,
      installmentsCount: 2,
      securityDeposit: 5000,
      paymentType: 'تحويل',
      notes: 'تم استلام الشكليات ويجري المتابعة النصف سنوية',
      status: 'نشط',
      installments: [
        {
          id: 'inst-3-1',
          contractId: 'cnt-3',
          installmentNo: 1,
          dueDate: '2026-03-01',
          amount: 40000,
          bankName: 'أبوظبي الأول',
          status: 'محصل',
          collectedDate: '2026-03-01',
          paymentMethod: 'تحويل بنكي'
        },
        {
          id: 'inst-3-2',
          contractId: 'cnt-3',
          installmentNo: 2,
          dueDate: '2026-09-01',
          amount: 40000,
          bankName: 'أبوظبي الأول',
          status: 'غير محصل',
          notes: 'الدفعة القادمة سبتمبر 2026'
        }
      ]
    }
  ],

  employeeDebts: [
    {
      id: 'debt-1',
      employeeName: 'محمد العتيبي',
      phone: '+971 50 888 1122',
      totalAmount: 3500,
      reason: 'بطاقة وسيط عقاري معتمد',
      date: '2026-05-10',
      notes: 'رسوم إصدار بطاقة الوساطة العقارية من دائرة الأراضي',
      repayments: [
        {
          id: 'rep-1-1',
          debtId: 'debt-1',
          amount: 1500,
          date: '2026-06-15',
          paymentMethod: 'خصم من الراتب',
          notes: 'دفعة سداد أولى من عمولة شهر يونيو'
        }
      ]
    },
    {
      id: 'debt-2',
      employeeName: 'عبدالله الحمادي',
      phone: '+971 52 777 3344',
      totalAmount: 5000,
      reason: 'سلفة شخصية طارئة',
      date: '2026-06-01',
      notes: 'موافقة المدير العام على السلفة بجدولة شهرية',
      repayments: [
        {
          id: 'rep-2-1',
          debtId: 'debt-2',
          amount: 2500,
          date: '2026-07-01',
          paymentMethod: 'نقد',
          notes: 'تسليم نقدي في الخزينة'
        }
      ]
    },
    {
      id: 'debt-3',
      employeeName: 'سارة الشامسي',
      phone: '+971 56 333 9988',
      totalAmount: 1200,
      reason: 'رسوم دوره تقييم عقاري',
      date: '2026-04-15',
      notes: 'تمت المسددة بالكامل عبر عمولات العقول',
      repayments: [
        {
          id: 'rep-3-1',
          debtId: 'debt-3',
          amount: 1200,
          date: '2026-05-01',
          paymentMethod: 'خصم من الراتب',
          notes: 'تسوية سداد كامل'
        }
      ]
    }
  ],

  projects: [
    {
      id: 'proj-1',
      name: 'مشروع صيانة وتأهيل بناية الريم',
      ownerName: 'سليمان الفاسي',
      area: 'الروضة',
      plotNumber: 'قطعة 412',
      contractorCompany: 'شركة الإنجاز للمقاولات العامة',
      date: '2026-04-01',
      totalAgreedPrice: 150000,
      notes: 'اتفاقية أعمال إعادة صيانة الواجهة والمصاعد والسباكة',
      items: [
        {
          id: 'item-1-1',
          projectId: 'proj-1',
          name: 'ترميم وتصليح الواجهة الخارجية والدهانات',
          value: 45000,
          date: '2026-04-10',
          status: 'مكتمل',
          paidAmount: 45000,
          notes: 'تم الاستلام والدفع بشيك'
        },
        {
          id: 'item-1-2',
          projectId: 'proj-1',
          name: 'تحديث المصعد الرئيسي وتغيير اللوحة الإلكترونية',
          value: 60000,
          date: '2026-05-20',
          status: 'مكتمل',
          paidAmount: 50000,
          notes: 'متبقي 10,000 درهم لحين الضمان النهائي'
        },
        {
          id: 'item-1-3',
          projectId: 'proj-1',
          name: 'صيانة شبكة المياه الرئيسية وتجديد مضخات الضغط',
          value: 45000,
          date: '2026-07-01',
          status: 'قيد التنفيذ',
          paidAmount: 15000,
          notes: 'جار الأعمال مع المقاول'
        }
      ]
    }
  ],

  executedProjects: [
    {
      id: 'ex-1',
      name: 'مشروع تطوير فيلا اللوتس الراقية',
      ownerName: 'الشيخ زايد بن حمدان',
      date: '2026-06-15',
      area: 'المرابع العربية',
      plotNumber: 'قطعة 881',
      type: 'تطوير فيلا سكنية',
      notes: 'مشروع تطوير وإعادة بيع بصفة حصري للمكتب',
      sellingPrice: 4800000,
      costItems: [
        { id: 'ci-1', name: 'سعر شراء الأرض والفيلا القديمة', value: 3100000, date: '2026-01-10', notes: 'سعر الشراء الأساسي' },
        { id: 'ci-2', name: 'رسوم المقاول والديكور الداخلي', value: 650000, date: '2026-03-01', notes: 'شركة الأبعاد الثلاثية للديكور' },
        { id: 'ci-3', name: 'رسوم الاستشاري الهندسي والتراخيص', value: 85000, date: '2026-03-15', notes: 'مكتب الرؤية للاستشارات' },
        { id: 'ci-4', name: 'رسوم التسجيل العقاري والتنفيذ (4%)', value: 124000, date: '2026-01-12', notes: 'دائرة الأراضي والأملاك' },
        { id: 'ci-5', name: 'عمولة ورسوم إدارة المكتب العقاري', value: 96000, date: '2026-06-15', notes: 'أتعاب المكتب' }
      ]
    },
    {
      id: 'ex-2',
      name: 'مشروع بناء معرض ومستودعات الخالدية',
      ownerName: 'شركة الأفق الاستثمارية',
      date: '2026-05-20',
      area: 'المنطقة الصناعية 3',
      plotNumber: 'قطعة 104',
      type: 'استثماري تجاري',
      notes: 'تم الإشراف والبيع لمستثمر خليجي',
      sellingPrice: 3200000,
      costItems: [
        { id: 'ci-21', name: 'سعر الأرض التجاري', value: 1800000, date: '2025-11-01', notes: 'أرض صناعية ممتازة' },
        { id: 'ci-22', name: 'رسوم المقاول الرئيسي والهيكل', value: 820000, date: '2026-02-10', notes: 'شركة البناء المتطور' },
        { id: 'ci-23', name: 'رسوم الاستشاري والدفاع المدني', value: 65000, date: '2026-02-28', notes: 'تراخيص معتمدة' },
        { id: 'ci-24', name: 'رسوم التسجيل والخدمات', value: 75000, date: '2026-05-10', notes: 'رسوم حكومية' }
      ]
    }
  ],

  obligations: [
    {
      id: 'ob-1',
      type: 'الرخصة التجارية للمكتب',
      issueDate: '2025-08-15',
      expiryDate: '2026-08-14',
      amount: 14500,
      responsiblePerson: 'أحمد المنصوري',
      status: 'قريب',
      notes: 'ينتهي الترخيص خلال أقل من 30 يوماً - المباشرة بالتجديد مع دائرة التنمية'
    },
    {
      id: 'ob-2',
      type: 'تجديد إيجار مقر المكتب الرئيسي',
      issueDate: '2025-09-01',
      expiryDate: '2026-08-31',
      amount: 60000,
      responsiblePerson: 'المدير العام',
      status: 'قريب',
      notes: 'إشعار التجديد مطلوب قبل 30 يوم من الانتهاء'
    },
    {
      id: 'ob-3',
      type: 'تأشيرات وإقامة الموظفين',
      issueDate: '2024-11-10',
      expiryDate: '2026-11-09',
      amount: 8500,
      responsiblePerson: 'سارة الشامسي',
      status: 'نشط',
      notes: 'تأشيرة الوسيط محمد العتيبي'
    },
    {
      id: 'ob-4',
      type: 'عقد صيانة أجهزة تكييف وخوادم المكتب',
      issueDate: '2025-06-01',
      expiryDate: '2026-05-31',
      amount: 3200,
      responsiblePerson: 'عبدالله الحمادي',
      status: 'متأخر',
      notes: 'العقد انتهى ويحتاج تجديد عاجل مع شركة التبريد'
    }
  ]
};

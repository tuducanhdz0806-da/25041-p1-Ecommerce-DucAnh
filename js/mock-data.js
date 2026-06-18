// js/mock-data.js


// Users
const mockUsers = [
    {
        id: 'u1',
        username: 'admin',
        password: 'admin123', 
        fullname: 'Quản Trị Viên',
        email: 'admin@gearshop.vn',
        phone: '0901001001',
        address: 'Tầng 5, Tòa nhà Landmark, Quận Bình Thạnh, TP.HCM',
        role: 'admin',
        status: 'active',
        createdAt: '2024-01-15T08:00:00Z'
    },
    {
        id: 'u2',
        username: 'ducanh',
        password: '123456',
        fullname: 'Từ Đức Anh',
        email: 'ducanh11@gmail.com',
        phone: '0902002002',
        address: 'Thường Tín, Hà Nội',
        role: 'customer',
        status: 'active',
        createdAt: '2024-03-20T10:30:00Z'
    },
    {
        id: 'u3',
        username: 'namdang',
        password: '123456',
        fullname: 'Đặng Hoài Nam',
        email: 'hoainam@outlook.com',
        phone: '0903003003',
        address: 'Thanh Liệt, Thanh Trì, Hà Nội ',
        role: 'customer',
        status: 'active',
        createdAt: '2024-05-10T14:15:00Z'
    }
];

// Danh muc san pham
const mockCategories = [
    { 
        id: 'c1', 
        name: 'PC Gaming', 
        slug: 'pc-gaming', 
        icon: 'fas fa-gamepad', 
        description: 'Máy tính chơi game cấu hình mạnh mẽ' 
    },
    { 
        id: 'c2', 
        name: 'PC Văn Phòng', 
        slug: 'pc-van-phong', 
        icon: 'fas fa-desktop', 
        description: 'Máy tính làm việc, học tập tiết kiệm' 
    },
    { 
        id: 'c3', 
        name: 'PC Đồ Họa', 
        slug: 'pc-do-hoa', 
        icon: 'fas fa-paint-brush', 
        description: 'Máy trạm thiết kế chuyên nghiệp' 
    },
    { 
        id: 'c4', 
        name: 'CPU', 
        slug: 'cpu', 
        icon: 'fas fa-microchip', 
        description: 'Bộ vi xử lý Intel & AMD' 
    },
    { 
        id: 'c5', 
        name: 'VGA', 
        slug: 'vga', 
        icon: 'fas fa-tv', 
        description: 'Card màn hình rời' 
    },
    { 
        id: 'c6', 
        name: 'Mainboard', 
        slug: 'mainboard', 
        icon: 'fas fa-th', 
        description: 'Bo mạch chủ' 
    },
    { 
        id: 'c7', 
        name: 'RAM', 
        slug: 'ram', 
        icon: 'fas fa-memory', 
        description: 'Bộ nhớ trong DDR4/DDR5'
    },
    { 
        id: 'c8', 
        name: 'SSD', 
        slug: 'ssd', 
        icon: 'fas fa-ssd', 
        description: 'Ổ cứng thể rắn NVMe/SATA' 
    },
    { 
        id: 'c9', 
        name: 'PSU (Nguồn)', 
        slug: 'psu-nguon', 
        icon: 'fas fa-plug', 
        description: 'Bộ nguồn máy tính'
    },
  
    { 
        id: 'c10', 
        name: 'Case', 
        slug: 'case', 
        icon: 'fas fa-box', 
        description: 'Vỏ máy tính' 
    }
];

// San pham mau
const mockProducts = [
  // --- PC Gaming ---
    {
      id: 'p1',
      name: 'PC Gaming GearShop Predator X (i9-14900K | RTX 4090)',
      categoryId: 'c1',
      price: 89990000,
      discountPrice: 85990000,
      stock: 3,
      image: 'images/products/pc-predator-x.jpg',
      description: 'Cỗ máy chiến game đỉnh cao, sẵn sàng cân mọi tựa game AAA ở độ phân giải 4K. Tản nhiệt AIO 360mm, case full mesh tối ưu luồng gió.',
      specifications: {
        'CPU': 'Intel Core i9-14900K (24 Nhân / 32 Luồng, up to 6.0GHz)',
        'VGA': 'MSI RTX 4090 SUPRIM X 24GB GDDR6X',
        'Mainboard': 'ASUS ROG STRIX Z790-F GAMING WIFI',
        'RAM': 'G.Skill Trident Z5 RGB 64GB (2x32GB) DDR5 6400MHz',
        'SSD': 'Samsung 990 Pro 2TB NVMe M.2 PCIe 4.0',
        'PSU': 'Corsair RM1200x SHIFT 1200W 80 Plus Gold',
        'Case': 'Hyte Y70 Touch Infinite (Black)',
        'Tản nhiệt': 'Corsair iCUE H150i ELITE LCD XT'
      },
      status: 'active',
      tags: ['gaming', 'cao cấp', 'rtx 4090', 'intel'],
      createdAt: '2024-06-01T09:00:00Z'
    },
    {
      id: 'p2',
      name: 'PC Gaming GearShop Titan R5 (Ryzen 5 7600X | RTX 4070 Super)',
      categoryId: 'c1',
      price: 33990000,
      discountPrice: 31990000,
      stock: 8,
      image: 'images/products/pc-titan-r5.jpg',
      description: 'Bộ PC tầm trung mạnh mẽ, hiệu năng tối ưu cho game 2K. Thiết kế tản nhiệt khí chất lượng, dễ dàng nâng cấp.',
      specifications: {
        'CPU': 'AMD Ryzen 5 7600X (6 Nhân / 12 Luồng, up to 5.3GHz)',
        'VGA': 'GIGABYTE RTX 4070 Super WINDFORCE OC 12G',
        'Mainboard': 'MSI MAG B650 TOMAHAWK WIFI',
        'RAM': 'Kingston Fury Beast RGB 32GB (2x16GB) DDR5 6000MHz',
        'SSD': 'WD Black SN850X 1TB NVMe M.2 PCIe 4.0',
        'PSU': 'MSI MAG A850GL PCIE5 850W 80 Plus Gold',
        'Case': 'Corsair 4000D Airflow (Black)',
        'Tản nhiệt': 'DeepCool AK620 Digital'
      },
      status: 'active',
      tags: ['gaming', 'tầm trung', 'rtx 4070', 'amd'],
      createdAt: '2024-06-10T11:00:00Z'
    },
  // --- PC Văn Phòng ---
    {
      id: 'p3',
      name: 'PC Văn Phòng Mini A (i3-14100 | UHD 730)',
      categoryId: 'c2',
      price: 9990000,
      discountPrice: null,
      stock: 15,
      image: 'images/products/pc-office-mini.jpg',
      description: 'Máy tính nhỏ gọn, mạnh mẽ cho công việc văn phòng, lướt web, xem phim. Tiết kiệm năng lượng, hoạt động êm ái.',
      specifications: {
        'CPU': 'Intel Core i3-14100 (4 Nhân / 8 Luồng, up to 4.7GHz)',
        'VGA': 'Intel UHD Graphics 730 (Tích hợp)',
        'Mainboard': 'ASUS PRIME H610M-K D4',
        'RAM': 'Kingston FURY Beast 16GB (2x8GB) DDR4 3200MHz',
        'SSD': 'Kingston NV2 500GB NVMe M.2 PCIe 4.0',
        'PSU': 'Corsair CV550 550W 80 Plus Bronze',
        'Case': 'Cooler Master MasterBox Q300L'
      },
      status: 'active',
      tags: ['văn phòng', 'nhỏ gọn', 'tiết kiệm'],
      createdAt: '2024-05-20T08:30:00Z'
    },
  // --- PC Đồ Họa ---
    {
      id: 'p4',
      name: 'PC Workstation Pro (i7-14700K | RTX 4070 Ti Super 16G)',
      categoryId: 'c3',
      price: 45990000,
      discountPrice: 43490000,
      stock: 5,
      image: 'images/products/pc-workstation-pro.jpg',
      description: 'Máy trạm chuyên dụng cho thiết kế 3D, render, dựng video. Ổn định, tốc độ xử lý đa nhiệm vượt trội.',
      specifications: {
        'CPU': 'Intel Core i7-14700K (20 Nhân / 28 Luồng)',
        'VGA': 'GIGABYTE RTX 4070 Ti Super GAMING OC 16G',
        'Mainboard': 'ASUS ProArt Z790-CREATOR WIFI',
        'RAM': 'Corsair Vengeance 64GB (2x32GB) DDR5 5600MHz',
        'SSD': 'Samsung 990 Pro 2TB + WD Black 4TB HDD',
        'PSU': 'Seasonic Focus GX-1000 1000W 80 Plus Gold',
        'Case': 'Fractal Design Meshify 2'
      },
      status: 'active',
      tags: ['đồ họa', 'workstation', 'render', 'intel'],
      createdAt: '2024-06-15T13:45:00Z'
    },
  // --- CPU ---
    {
      id: 'p5',
      name: 'CPU Intel Core i9-14900K (3.2GHz up to 6.0GHz, 24 Nhân 32 Luồng)',
      categoryId: 'c4',
      price: 15490000,
      discountPrice: 14590000,
      stock: 10,
      image: 'images/products/cpu-i9-14900k.jpg',
      description: 'CPU flagship thế hệ 14 của Intel. Hiệu năng đơn nhân và đa nhân đỉnh cao cho gaming và sáng tạo nội dung.',
      specifications: {
        'Socket': 'LGA 1700',
        'Số nhân': '24 (8 Performance + 16 Efficient)',
        'Số luồng': '32',
        'Xung tối đa': '6.0 GHz',
        'Bộ nhớ đệm': '36MB Intel Smart Cache',
        'TDP': '125W (Base) / 253W (Turbo)'
      },
      status: 'active',
      tags: ['intel', 'cpu', 'i9'],
      createdAt: '2024-01-10T00:00:00Z'
    },
    {
      id: 'p6',
      name: 'CPU AMD Ryzen 7 7800X3D (4.2GHz up to 5.0GHz, 8 Nhân 16 Luồng)',
      categoryId: 'c4',
      price: 9990000,
      discountPrice: null,
      stock: 20,
      image: 'images/products/cpu-r7-7800x3d.jpg',
      description: 'CPU gaming tốt nhất của AMD với công nghệ 3D V-Cache, mang lại hiệu năng chơi game vượt trội.',
      specifications: {
        'Socket': 'AM5',
        'Số nhân': '8',
        'Số luồng': '16',
        'Xung tối đa': '5.0 GHz',
        'Bộ nhớ đệm': '104MB (L3: 96MB + L2: 8MB)',
        'TDP': '120W'
      },
      status: 'active',
      tags: ['amd', 'cpu', 'ryzen', 'x3d'],
      createdAt: '2024-02-15T00:00:00Z'
    },
  // --- VGA ---
    {
      id: 'p7',
      name: 'MSI GeForce RTX 4090 SUPRIM X 24GB GDDR6X',
      categoryId: 'c5',
      price: 54990000,
      discountPrice: 51990000,
      stock: 2,
      image: 'images/products/vga-rtx4090.jpg',
      description: 'Card đồ họa mạnh nhất hành tinh. Hỗ trợ DLSS 3.5, Ray Tracing đỉnh cao, thiết kế tản nhiệt TRI FROZR 3S.',
      specifications: {
        'GPU': 'NVIDIA GeForce RTX 4090',
        'VRAM': '24GB GDDR6X',
        'Bus': '384-bit',
        'Xung': '2625 MHz (Boost)',
        'Cổng': '3x DP 1.4a, 1x HDMI 2.1'
      },
      status: 'active',
      tags: ['nvidia', 'rtx', '4090', 'cao cấp'],
      createdAt: '2024-03-01T00:00:00Z'
    },
    {
      id: 'p8',
      name: 'GIGABYTE GeForce RTX 4070 Super WINDFORCE OC 12G',
      categoryId: 'c5',
      price: 15990000,
      discountPrice: 15490000,
      stock: 15,
      image: 'images/products/vga-rtx4070super.jpg',
      description: 'Lựa chọn tuyệt vời cho game 2K max setting. Tiết kiệm điện, mát mẻ với tản nhiệt WINDFORCE.',
      specifications: {
        'GPU': 'NVIDIA GeForce RTX 4070 Super',
        'VRAM': '12GB GDDR6X',
        'Bus': '192-bit',
        'Xung': '2505 MHz (Boost)',
        'Cổng': '3x DP 1.4a, 1x HDMI 2.1a'
      },
      status: 'active',
      tags: ['nvidia', 'rtx', '4070', 'tầm trung'],
      createdAt: '2024-04-10T00:00:00Z'
    },
  // --- Mainboard ---
    {
      id: 'p9',
      name: 'Mainboard ASUS ROG STRIX Z790-F GAMING WIFI (LGA1700, DDR5)',
      categoryId: 'c6',
      price: 9490000,
      discountPrice: 8990000,
      stock: 7,
      image: 'images/products/mainboard-z790.jpg',
      description: 'Bo mạch chủ cao cấp cho Intel thế hệ 12/13/14. VRM 16+1+2 mạnh mẽ, WiFi 6E, LAN 2.5G.',
      specifications: {
        'Socket': 'LGA 1700',
        'Chipset': 'Intel Z790',
        'RAM': '4x DDR5 (Max 192GB, 7800+ MHz OC)',
        'Khe M.2': '4x PCIe 4.0',
        'Audio': 'ROG SupremeFX ALC4080'
      },
      status: 'active',
      tags: ['asus', 'mainboard', 'z790', 'intel'],
      createdAt: '2024-02-20T00:00:00Z'
    },
    {
      id: 'p10',
      name: 'Mainboard MSI MAG B650 TOMAHAWK WIFI (AM5, DDR5)',
      categoryId: 'c6',
      price: 5990000,
      discountPrice: null,
      stock: 12,
      image: 'images/products/mainboard-b650.jpg',
      description: 'Mainboard AMD B650 cực kỳ ổn định cho Ryzen 7000/8000. VRM 14+2+1, khe M.2 Gen5, Wi-Fi 6E.',
      specifications: {
        'Socket': 'AM5',
        'Chipset': 'AMD B650',
        'RAM': '4x DDR5 (Max 256GB, 6400+ MHz OC)',
        'Khe M.2': '1x Gen5 + 2x Gen4',
        'Audio': 'Realtek ALC4080'
      },
      status: 'active',
      tags: ['msi', 'mainboard', 'b650', 'amd'],
      createdAt: '2024-03-15T00:00:00Z'
    },
  // --- RAM ---
    {
      id: 'p11',
      name: 'G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5 6400MHz CL32',
      categoryId: 'c7',
      price: 3490000,
      discountPrice: 3290000,
      stock: 25,
      image: 'images/products/ram-tridentz5.jpg',
      description: 'RAM DDR5 cao cấp, hiệu năng siêu tốc, thiết kế RGB đẹp mắt, tương thích Intel XMP 3.0.',
      specifications: {
        'Dung lượng': '32GB (2x16GB)',
        'Loại': 'DDR5',
        'Tốc độ': '6400 MHz',
        'Độ trễ': 'CL32-39-39-102',
        'Điện áp': '1.40V'
      },
      status: 'active',
      tags: ['gskill', 'ram', 'ddr5', 'rgb'],
      createdAt: '2024-05-01T00:00:00Z'
    },
    {
      id: 'p12',
      name: 'Kingston FURY Beast 32GB (2x16GB) DDR4 3600MHz CL18',
      categoryId: 'c7',
      price: 1890000,
      discountPrice: null,
      stock: 40,
      image: 'images/products/ram-furybeast.jpg',
      description: 'RAM DDR4 giá tốt, ổn định. Tản nhiệt thấp cấp, tương thích rộng rãi.',
      specifications: {
        'Dung lượng': '32GB (2x16GB)',
        'Loại': 'DDR4',
        'Tốc độ': '3600 MHz',
        'Độ trễ': 'CL18-22-22-42',
        'Điện áp': '1.35V'
      },
      status: 'active',
      tags: ['kingston', 'ram', 'ddr4'],
      createdAt: '2024-01-25T00:00:00Z'
    },
  // --- SSD ---
    {
      id: 'p13',
      name: 'SSD Samsung 990 Pro 1TB M.2 NVMe PCIe 4.0',
      categoryId: 'c8',
      price: 2990000,
      discountPrice: 2790000,
      stock: 30,
      image: 'images/products/ssd-990pro.jpg',
      description: 'SSD NVMe đỉnh cao, tốc độ đọc 7450MB/s, ghi 6900MB/s. Tối ưu cho gaming và sáng tạo.',
      specifications: {
        'Dung lượng': '1TB',
        'Chuẩn': 'M.2 2280 NVMe PCIe 4.0 x4',
        'Đọc': '7.450 MB/s',
        'Ghi': '6.900 MB/s',
        'TBW': '600TB'
      },
      status: 'active',
      tags: ['samsung', 'ssd', 'nvme', 'pcie4'],
      createdAt: '2024-04-05T00:00:00Z'
    },
    {
      id: 'p14',
      name: 'SSD WD Blue SN580 500GB M.2 NVMe PCIe 4.0',
      categoryId: 'c8',
      price: 1190000,
      discountPrice: null,
      stock: 50,
      image: 'images/products/ssd-sn580.jpg',
      description: 'SSD giá rẻ cho nhu cầu phổ thông, tốc độ ổn định, tiết kiệm điện.',
      specifications: {
        'Dung lượng': '500GB',
        'Chuẩn': 'M.2 2280 NVMe PCIe 4.0 x4',
        'Đọc': '4.150 MB/s',
        'Ghi': '4.000 MB/s',
        'TBW': '300TB'
      },
      status: 'active',
      tags: ['wd', 'ssd', 'nvme', 'giá rẻ'],
      createdAt: '2024-02-10T00:00:00Z'
    },
  // --- PSU ---
    {
      id: 'p15',
      name: 'Corsair RM1000e 1000W 80 Plus Gold Full Modular (ATX 3.0, PCIe 5.0)',
      categoryId: 'c9',
      price: 3890000,
      discountPrice: 3590000,
      stock: 15,
      image: 'images/products/psu-rm1000e.jpg',
      description: 'Nguồn full modular cao cấp, hỗ trợ chuẩn ATX 3.0 và PCIe 5.0, sẵn sàng cho RTX 40 Series.',
      specifications: {
        'Công suất': '1000W',
        'Chuẩn': '80 Plus Gold',
        'Dạng': 'Full Modular',
        'Quạt': '135mm Rifle Bearing',
        'Kết nối': '1x 24-pin, 2x EPS, 1x 12VHPWR, 8x SATA...'
      },
      status: 'active',
      tags: ['corsair', 'psu', 'nguồn', '1000w', 'gold'],
      createdAt: '2024-03-20T00:00:00Z'
    },
    {
      id: 'p16',
      name: 'MSI MAG A850GL PCIE5 850W 80 Plus Gold Full Modular',
      categoryId: 'c9',
      price: 2890000,
      discountPrice: null,
      stock: 20,
      image: 'images/products/psu-a850gl.jpg',
      description: 'Nguồn 850W hiệu năng cao, hỗ trợ cáp nguồn 12VHPWR đi kèm, phù hợp RTX 4070/4080.',
      specifications: {
        'Công suất': '850W',
        'Chuẩn': '80 Plus Gold',
        'Dạng': 'Full Modular',
        'Quạt': '120mm FDB',
        'Kết nối': '1x 24-pin, 2x EPS, 1x 12VHPWR, 6x SATA...'
      },
      status: 'active',
      tags: ['msi', 'psu', 'nguồn', '850w', 'gold'],
      createdAt: '2024-04-15T00:00:00Z'
    },
  // --- Case ---
    {
      id: 'p17',
      name: 'Hyte Y70 Touch Infinite (Black) Mid Tower Case',
      categoryId: 'c10',
      price: 8490000,
      discountPrice: 7990000,
      stock: 4,
      image: 'images/products/case-y70.jpg',
      description: 'Case PC cao cấp mặt kính cong panorama, tích hợp màn hình cảm ứng 14.1 inch, không gian rộng rãi.',
      specifications: {
        'Loại': 'Mid Tower',
        'Mainboard': 'ATX / mATX / ITX',
        'Khe mở rộng': '7 + 6 (Vertical)',
        'Quạt đi kèm': '3x 120mm (Mặt trước) + 1x 120mm (Sau)',
        'Hỗ trợ tản nhiệt nước': 'Top: 360mm, Side: 360mm, Rear: 120mm'
      },
      status: 'active',
      tags: ['hyte', 'case', 'panorama', 'touchscreen'],
      createdAt: '2024-06-01T00:00:00Z'
    },
    {
      id: 'p18',
      name: 'Corsair 4000D Airflow (Black) Mid Tower Case',
      categoryId: 'c10',
      price: 1990000,
      discountPrice: 1790000,
      stock: 22,
      image: 'images/products/case-4000d.jpg',
      description: 'Case PC tối ưu luồng gió, mặt trước dạng lưới, quản lý cáp dễ dàng, tương thích tốt.',
      specifications: {
        'Loại': 'Mid Tower',
        'Mainboard': 'ATX / mATX / ITX',
        'Khe mở rộng': '7',
        'Quạt đi kèm': '2x 120mm AirGuide',
        'Hỗ trợ tản nhiệt nước': 'Top: 280mm, Front: 360mm, Rear: 120mm'
      },
      status: 'active',
      tags: ['corsair', 'case', 'airflow', 'giá tốt'],
      createdAt: '2024-01-10T00:00:00Z'
    },
];

// Don hang mau
const mockOrders = [
  {
    id: 'ord001',
    userId: 'u2', 
    products: [
      {
        productId: 'p2',
        name: 'PC Gaming GearShop Titan R5 (Ryzen 5 7600X | RTX 4070 Super)',
        price: 33990000,
        discountPrice: 31990000,
        quantity: 1,
        image: 'images/products/pc-titan-r5.jpg'
      },
      {
        productId: 'p14',
        name: 'SSD WD Blue SN580 500GB M.2 NVMe PCIe 4.0',
        price: 1190000,
        discountPrice: null,
        quantity: 1,
        image: 'images/products/ssd-sn580.jpg'
      }
    ],
    totalPrice: 33180000,
    shippingAddress: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    paymentMethod: 'cod',
    status: 'pending',
    note: 'Giao hàng giờ hành chính, vui lòng gọi trước 15 phút.',
    createdAt: '2024-06-20T09:15:30Z'
  },
  {
    id: 'ord002',
    userId: 'u3', 
    products: [
      {
        productId: 'p5',
        name: 'CPU Intel Core i9-14900K (3.2GHz up to 6.0GHz, 24 Nhân 32 Luồng)',
        price: 15490000,
        discountPrice: 14590000,
        quantity: 1,
        image: 'images/products/cpu-i9-14900k.jpg'
      },
      {
        productId: 'p9',
        name: 'Mainboard ASUS ROG STRIX Z790-F GAMING WIFI (LGA1700, DDR5)',
        price: 9490000,
        discountPrice: 8990000,
        quantity: 1,
        image: 'images/products/mainboard-z790.jpg'
      },
      {
        productId: 'p11',
        name: 'G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5 6400MHz CL32',
        price: 3490000,
        discountPrice: 3290000,
        quantity: 1,
        image: 'images/products/ram-tridentz5.jpg'
      }
    ],
    totalPrice: 24870000,
    shippingAddress: '456 Lê Duẩn, Quận Hải Châu, Đà Nẵng',
    paymentMethod: 'banking',
    status: 'processing',
    note: '',
    createdAt: '2024-06-18T14:45:00Z'
  }
];

window.MOCK_USERS = mockUsers;
window.MOCK_CATEGORIES = mockCategories;
window.MOCK_PRODUCTS = mockProducts;
window.MOCK_ORDERS = mockOrders;
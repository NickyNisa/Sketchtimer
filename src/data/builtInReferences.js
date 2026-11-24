
const toSvgDataUri = (svg) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`

export const TIMER_OPTIONS = [
  { label: '30 วินาที', shortLabel: '30 วิ', value: 30, desc: 'วาดเส้นเร็ว (Gesture / Quick Sketch)' },
  { label: '1 นาที', shortLabel: '1 นาที', value: 60, desc: 'จับสัดส่วนและโครงสร้างหลัก' },
  { label: '5 นาที', shortLabel: '5 นาที', value: 300, desc: 'เก็บรายละเอียดและน้ำหนักแสงเงา' },
]

export const CATEGORY_OPTIONS = [
  { label: 'รูปทรงเรขาคณิต', value: 'geometry', icon: 'category', color: 'primary' },
  { label: 'ท่าทาง (Pose / Gesture)', value: 'pose', icon: 'accessibility_new', color: 'secondary' },
  { label: 'อัปโหลดเอง (Custom)', value: 'custom', icon: 'collections', color: 'accent' },
]

export const BUILTIN_GEOMETRY = [
  {
    id: 'geo-1',
    category: 'geometry',
    duration: 60,
    imageUrl:'/images/Geo-1.jpg',
  },
  {
    id: 'geo-2',
    category: 'geometry',
    duration: 60,
    imageUrl:'/images/Geo-2.jpg',
  },
  {
    id: 'geo-3',
    category: 'geometry',
    duration: 300,
    imageUrl:'/images/Geo-3.jpg',
  },
  {
    id: 'geo-4',
    category: 'geometry',
    duration: 300,
    imageUrl:'/images/Geo-4.jpg',
  },
]

export const BUILTIN_POSES = [
  {
    id: 'pose-1',
    category: 'pose',
    duration: 30,
    imageUrl:'/images/pose-1.jpg',
  },
  {
    id: 'pose-2',
    category: 'pose',
    duration: 30,
    imageUrl:'/images/pose-2.jpg',
  },
  {
    id: 'pose-3',
    category: 'pose',
    duration: 60,
    imageUrl:'/images/pose-3.jpg',
  },
  {
    id: 'pose-4',
    category: 'pose',
    duration: 60,
    imageUrl:'/images/pose-4.jpg',
  },
]

// ===== DATABASE (Supabase) =====
const SUPABASE_URL = 'https://xxodvdfwyojhezijljgz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_XjUmK_8J9ri0g2c72eVW5A_TixYReU-';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function loadDB() {
  try {
    const { data, error } = await supabaseClient.from('sync_data').select('db_json').eq('id', 1).single();
    if (error) {
      console.error('Load DB error from Supabase:', error);
      alert('Không thể tải dữ liệu từ đám mây. Hãy chắc chắn bạn đã tạo bảng SQL như hướng dẫn!');
      return;
    }
    if (data && data.db_json) {
      DB.students = data.db_json.students || [];
      DB.classes  = data.db_json.classes  || [];
      DB.receipts  = data.db_json.receipts  || [];
      DB.discounts = data.db_json.discounts || [];
    }
  } catch(e) { console.error('Load DB Exception:', e); }
}

async function saveDB() {
  try {
    const { error } = await supabaseClient.from('sync_data').update({ db_json: DB }).eq('id', 1);
    if (error) console.error('Save DB error from Supabase:', error);
  } catch(e) { console.error('Save DB Exception:', e); }
}

const DB = {
  students: [],
  classes: [],
  receipts: [],
  discounts: []
};

// ===== HELPERS =====
function getClassById(id) { return DB.classes.find(c => c.id === id); }
function getStudentsByClass(classId) { return DB.students.filter(s => s.centerClass === classId); }
function formatCurrency(n) { return Number(n).toLocaleString('vi-VN') + ' VNĐ'; }
function formatDate(d) { if (!d) return ''; const p = d.split('-'); return p[2]+'/'+p[1]+'/'+p[0]; }

function genStudentId(name, classId) {
  const parts = name.trim().split(/\s+/);
  const lastName = parts[parts.length - 1];
  const noAccent = lastName.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\u0111/gi,'d').toUpperCase();
  const base = `${noAccent}-${classId}`;
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // bỏ ký tự dễ nhầm (0,O,1,I)
  const usedSuffixes = new Set(DB.students.map(s => {
    const p = s.id.split('-');
    return p[p.length - 1];
  }));
  let suffix;
  do {
    suffix = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (usedSuffixes.has(suffix));
  return `${base}-${suffix}`;
}

function genClassId(name) {
  const noAccent = name.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').replace(/\s+/g,'').toUpperCase();
  const existing = new Set(DB.classes.map(c => c.id));
  let num;
  do { num = Math.floor(Math.random() * 900) + 100; } while (existing.has(`${noAccent}-${num}`));
  return `${noAccent}-${num}`;
}

// Bỏ gọi hàm loadDB() ở đây để chuyển sang gọi bên app.js

function genId(prefix, arr) {
  const nums = arr.map(x => parseInt(x.id.replace(prefix,''))).filter(n=>!isNaN(n));
  const next = nums.length ? Math.max(...nums)+1 : 1;
  return prefix + String(next).padStart(3,'0');
}

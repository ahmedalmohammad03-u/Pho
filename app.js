// === قائمة الأعيـادات الأساسية ===
const clinicsList = [
  "الجراحة البولية","الجراحة العظمية","الجراحة العامة",
  "الجراحة العصبية","الجراحة التجميلية","الجراحة الفكية",
  "الداخلية العامة","الداخلية العصبية","الداخلية القلبية",
  "الداخلية الهضمية","الداخلية الغدية","الداخلية الصدرية",
  "الإذنية","العينية","النسائية","الأطفال","الأوعية والدم",
  "أمراض اللثة","تقويم الأسنان"
];

// === التهيئة عند أول تحميل ===
function initStorage() {
  if (!localStorage.getItem("clinics")) {
    const clinics = clinicsList.map((name, i) => ({ id: i, name, max: 0 }));
    localStorage.setItem("clinics", JSON.stringify(clinics));
  }
  if (!localStorage.getItem("admins")) {
    const admins = [{ user: "admin", pass: "pho123123" }];
    localStorage.setItem("admins", JSON.stringify(admins));
  }
  if (!localStorage.getItem("registrations")) {
    localStorage.setItem("registrations", JSON.stringify([]));
  }
}

// === الانتقال بين الصفحات ===
document.addEventListener("DOMContentLoaded", () => {
  initStorage();

  // index.html
  const toBooking = document.getElementById("toBooking");
  const toAdmin   = document.getElementById("toAdmin");
  if (toBooking) toBooking.onclick = _ => location.href = "booking.html";
  if (toAdmin)   toAdmin.onclick   = _ => location.href = "admin.html";

  // booking.html
  const bookingForm = document.getElementById("bookingForm");
  if (bookingForm) {
    const clinicsSelect = document.getElementById("clinics");
    JSON.parse(localStorage.getItem("clinics")).forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.id;  opt.textContent = c.name;
      clinicsSelect.appendChild(opt);
    });

    bookingForm.onsubmit = e => {
      e.preventDefault();
      const fullName   = document.getElementById("fullName").value.trim();
      const age        = +document.getElementById("age").value;
      const gender     = document.getElementById("gender").value;
      const category   = document.getElementById("category").value;
      const note       = document.getElementById("note").value.trim();
      const gov        = document.getElementById("governorate").value.trim();
      const addr       = document.getElementById("address").value.trim();
      const selected   = Array.from(clinicsSelect.selectedOptions).map(o => +o.value);

      let clinics = JSON.parse(localStorage.getItem("clinics"));
      let regs    = JSON.parse(localStorage.getItem("registrations"));
      // تحقق من السعة
      for (let id of selected) {
        const clinic = clinics.find(c => c.id === id);
        const count  = regs.filter(r => r.clinicId === id).length;
        if (count >= clinic.max) {
          return alert(`نعتذر، أكتمل العدد في ${clinic.name}، نرجو التسجيل غداً.`);
        }
      }
      // تسجيل المريض
      const timestamp = new Date().toISOString();
      selected.forEach(id => {
        regs.push({ clinicId: id, fullName, age, gender, category, note, gov, addr, timestamp });
      });
      localStorage.setItem("registrations", JSON.stringify(regs));
      alert("تم التسجيل بنجاح!");
      location.href = "index.html";
    };
  }

  // admin.html
  const loginForm    = document.getElementById("loginForm");
  const loginSection = document.getElementById("loginSection");
  const dashSection  = document.getElementById("dashboardSection");
  if (loginForm) {
    loginForm.onsubmit = e => {
      e.preventDefault();
      const u = document.getElementById("loginUser").value.trim();
      const p = document.getElementById("loginPass").value;
      const admins = JSON.parse(localStorage.getItem("admins"));
      if (admins.some(a => a.user === u && a.pass === p)) {
        sessionStorage.setItem("adminLoggedIn", "1");
        renderDashboard();
      } else {
        alert("بيانات الدخول غير صحيحة.");
      }
    };
    // إذا سبق ودخل
    if (sessionStorage.getItem("adminLoggedIn")) {
      renderDashboard();
    }
  }

  // إضافة مسؤول جديد
  const addAdminForm = document.getElementById("addAdminForm");
  if (addAdminForm) {
    addAdminForm.onsubmit = e => {
      e.preventDefault();
      const u = document.getElementById("newAdminUser").value.trim();
      const p = document.getElementById("newAdminPass").value;
      let admins = JSON.parse(localStorage.getItem("admins"));
      if (admins.some(a => a.user === u)) {
        return alert("اسم المستخدم موجود مسبقاً.");
      }
      admins.push({ user: u, pass: p });
      localStorage.setItem("admins", JSON.stringify(admins));
      alert("تم إضافة المسؤول بنجاح.");
      addAdminForm.reset();
    };
  }
});

// === رسم لوحة المسؤول ===
function renderDashboard() {
  document.getElementById("loginSection").classList.add("hidden");
  const dash = document.getElementById("dashboardSection");
  dash.classList.remove("hidden");

  const clinics = JSON.parse(localStorage.getItem("clinics"));
  const regs    = JSON.parse(localStorage.getItem("registrations"));

  // تعبئة نموذج السعة
  const capForm = document.getElementById("capacityForm");
  capForm.innerHTML = "";
  clinics.forEach(c => {
    const lbl = document.createElement("label");
    lbl.textContent = c.name + ": ";
    const inp = document.createElement("input");
    inp.type = "number"; inp.min = 0; inp.value = c.max;
    inp.id    = "cap_" + c.id;
    lbl.appendChild(inp);
    capForm.appendChild(lbl);
  });

  document.getElementById("saveCaps").onclick = () => {
    clinics.forEach(c => {
      const v = +document.getElementById("cap_" + c.id).value;
      c.max = isNaN(v) ? 0 : v;
    });
    localStorage.setItem("clinics", JSON.stringify(clinics));
    alert("تم تحديث الطاقة الاستيعابية.");
  };

  // ملء جدول التسجيلات
  const tbody = document.querySelector("#regsTable tbody");
  tbody.innerHTML = "";
  regs.forEach(r => {
    const tr = document.createElement("tr");
    const clinicName = clinics.find(c => c.id === r.clinicId).name;
    [clinicName, r.fullName, r.age, r.gender, r.category, r.gov, r.addr, r.timestamp]
      .forEach(txt => {
        const td = document.createElement("td");
        td.textContent = txt;
        tr.appendChild(td);
      });
    tbody.appendChild(tr);
  });

  // زر التصدير CSV
  document.getElementById("exportCSV").onclick = () => {
    let csv = [
      ["العيادة","الإسم","العمر","الجنس","الفئة","المحافظة","العنوان","تاريخ التسجيل"]
    ];
    regs.forEach(r => {
      const clinicName = clinics.find(c => c.id === r.clinicId).name;
      csv.push([
        clinicName, r.fullName, r.age, r.gender,
        r.category, r.gov, r.addr, r.timestamp
      ]);
    });
    const csvContent = csv.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "registrations.csv";
    link.click();
  };
}
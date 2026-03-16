import React from "react";
import { useEffect, useMemo, useState } from "react";
import MobileApp from "./MobileApp";

const staffOptions = ["龍子", "浮田", "篤", "鈴木", "大泉", "小野寺", "藤井", "田中", "斎藤", "及川"];
const activityOptions = ["受任", "定期訪問", "他団体", "相談", "イベント", "打合せ", "事務"];

const initialForm = {
  date: "",
  staff: staffOptions[0],
  activity: activityOptions[0],
  people: "",
  hours: "",
  transport: "",
  reward: "",
  settled: false,
  memo: "",
  image: "",
};

function DesktopApp() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [monthFilter, setMonthFilter] = useState("all");
  const [staffFilter, setStaffFilter] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [onlyUnsettled, setOnlyUnsettled] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("premo_records_reference_ui");
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch {
        setRecords([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("premo_records_reference_ui", JSON.stringify(records));
  }, [records]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm((prev) => ({ ...prev, image: ev.target?.result || "" }));
    reader.readAsDataURL(file);
  };

  const addRecord = () => {
    if (!form.date || !form.staff || !form.activity) {
      alert("活動日・担当者・活動を入力してください。");
      return;
    }
    setRecords((prev) => [...prev, { ...form, id: crypto.randomUUID() }]);
    setForm(initialForm);
  };

  const toggleSettled = (id) => {
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, settled: !r.settled } : r)));
  };

  const deleteRecord = (id) => {
    if (!window.confirm("この記録を削除しますか？")) return;
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const monthOptions = useMemo(
    () => [...new Set(records.map((r) => (r.date || "").slice(0, 7)).filter(Boolean))].sort(),
    [records]
  );

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const month = (r.date || "").slice(0, 7);
      const keywordHit = keyword
        ? [r.date, r.staff, r.activity, r.memo].some((v) => String(v || "").includes(keyword))
        : true;

      return (
        (monthFilter === "all" || month === monthFilter) &&
        (staffFilter === "all" || r.staff === staffFilter) &&
        (!onlyUnsettled || !r.settled) &&
        keywordHit
      );
    });
  }, [records, monthFilter, staffFilter, onlyUnsettled, keyword]);

  const totals = useMemo(() => {
    const transport = filteredRecords.reduce((sum, r) => sum + Number(r.transport || 0), 0);
    const reward = filteredRecords.reduce((sum, r) => sum + Number(r.reward || 0), 0);
    return {
      transport,
      reward,
      total: transport + reward,
      unsettled: filteredRecords.filter((r) => !r.settled).length,
    };
  }, [filteredRecords]);

  const exportCSV = () => {
    const rows = [
      ["日付", "担当", "活動", "交通費", "報酬", "清算状況", "メモ"],
      ...filteredRecords.map((r) => [
        r.date,
        r.staff,
        r.activity,
        r.transport,
        r.reward,
        r.settled ? "清算済" : "未清算",
        r.memo,
      ]),
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "premo_activity.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "premo_backup.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={pageStyle}>
      <div style={fogTopStyle} />
      <div style={leafGlowLeftStyle} />
      <div style={leafGlowRightStyle} />
      <div style={leafClusterLeftStyle} />
      <div style={leafClusterRightStyle} />

      <div style={containerStyle}>
        <header style={headerStyle}>
          <div style={titleRowStyle}>
            <div style={logoStyle}>🌱</div>
            <div>
              <h1 style={titleStyle}>PREMO活動記録</h1>
              <div style={titleUnderlineStyle} />
            </div>
          </div>
        </header>

        <section style={mainCardStyle}>
          <div style={formRow1Style}>
            <input style={inputStyle} type="date" name="date" value={form.date} onChange={handleChange} />
            <select style={inputStyle} name="staff" value={form.staff} onChange={handleChange}>
              {staffOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <input style={inputStyle} name="people" placeholder="人数" value={form.people} onChange={handleChange} />
          </div>

          <div style={formRow2Style}>
            <input style={inputStyle} name="transport" placeholder="交通費" value={form.transport} onChange={handleChange} />
            <select style={inputStyle} name="activity" value={form.activity} onChange={handleChange}>
              {activityOptions.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <input style={inputStyle} name="hours" placeholder="時間" value={form.hours} onChange={handleChange} />
          </div>

          <div style={formRow3Style}>
            <input style={inputStyle} name="reward" placeholder="交通費（円）" value={form.reward} onChange={handleChange} />
            <input style={inputStyle} name="memo" placeholder="メモ" value={form.memo} onChange={handleChange} />
            <div style={rightControlsStyle}>
              <label style={checkboxLabelStyle}>
                <input type="checkbox" name="settled" checked={form.settled} onChange={handleChange} />
                清算済
              </label>
              <label style={fileButtonStyle}>
                ファイルを選択
                <input type="file" onChange={handleImage} style={{ display: "none" }} />
              </label>
            </div>
          </div>

          <div style={buttonCenterRowStyle}>
            <button style={primaryButtonStyle} onClick={addRecord}>追加</button>
            <button style={softButtonStyle} onClick={exportCSV}>CSV出力</button>
            <button style={softButtonStyle} onClick={exportBackup}>バックアップ</button>
          </div>
        </section>

        <section style={summaryGridStyle}>
          <SummaryCard title="交通費合計" value={`${totals.transport.toLocaleString()} 円`} />
          <SummaryCard title="報酬合計" value={`${totals.reward.toLocaleString()} 円`} />
          <SummaryCard title="支払合計" value={`${totals.total.toLocaleString()} 円`} />
          <SummaryCard title="未清算件数 ›" value={`${totals.unsettled} 件`} />
        </section>

        <section style={filterRowStyle}>
          <select style={filterSelectStyle} value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
            <option value="all">月: 全て</option>
            {monthOptions.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select style={filterSelectStyle} value={staffFilter} onChange={(e) => setStaffFilter(e.target.value)}>
            <option value="all">担当者: 全て</option>
            {staffOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button style={filterButtonStyle} onClick={() => setOnlyUnsettled((v) => !v)}>
            {onlyUnsettled ? "未清算のみ解除" : "未清算める"}
          </button>
          <input style={filterInputStyle} placeholder="キーワード検索" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          <button style={softButtonStyle} onClick={exportCSV}>CSV出力</button>
          <button style={softButtonStyle}>月別清算書PDF</button>
        </section>

        <section style={iconSummaryPanelStyle}>
          <IconCard icon="🚌" title="交通費合計" value={`${totals.transport.toLocaleString()} 円`} />
          <IconCard icon="💴" title="報酬合計" value={`${totals.reward.toLocaleString()} 円`} />
          <IconCard icon="✅" title="支払合計" value={`${totals.total.toLocaleString()} 円`} />
          <IconCard icon="⚠️" title="未清算件数 ›" value={`${totals.unsettled} 件`} isLast />
        </section>

        <section style={tablePanelStyle}>
          <div style={tableTopBarStyle}>
            <button style={bluePillStyle}>月:</button>
            <select style={miniSelectStyle} value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
              <option value="all">全て</option>
              {monthOptions.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <select style={miniSelectStyle} value={staffFilter} onChange={(e) => setStaffFilter(e.target.value)}>
              <option value="all">担当者:</option>
              {staffOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <div style={searchGroupStyle}>
              <input style={searchInputStyle} placeholder="キーワード検索" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
              <button style={searchButtonStyle}>🔍</button>
            </div>
            <button style={softButtonStyle} onClick={exportCSV}>CSV出力</button>
            <button style={softButtonStyle}>月別清算書PDF</button>
          </div>

          <table style={tableStyle}>
            <thead>
              <tr>
                {["日付", "担当", "活動", "交通費", "報酬", "操作"].map((head) => (
                  <th key={head} style={thStyle}>{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} style={emptyCellStyle}>まだデータがありません</td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id}>
                    <td style={tdStyle}>{r.date}</td>
                    <td style={tdStyle}>{r.staff}</td>
                    <td style={tdStyle}>{r.activity}</td>
                    <td style={tdStyle}>{Number(r.transport || 0).toLocaleString()} 円</td>
                    <td style={tdStyle}>{Number(r.reward || 0).toLocaleString()} 円</td>
                    <td style={tdStyle}>
                      <div style={actionWrapStyle}>
                        <button style={confirmButtonStyle} onClick={() => toggleSettled(r.id)}>確認</button>
                        <button style={deleteButtonStyle} onClick={() => deleteRecord(r.id)}>削除</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div style={summaryCardStyle}>
      <div style={summaryTitleStyle}>{title}</div>
      <div style={summaryValueStyle}>{value}</div>
    </div>
  );
}

function IconCard({ icon, title, value, isLast }) {
  return (
    <div style={{ ...iconCardStyle, borderRight: isLast ? "none" : "1px solid #e6eef5" }}>
      <div style={iconCardTopStyle}>
        <span style={iconStyle}>{icon}</span>
        <span style={iconCardTitleStyle}>{title}</span>
      </div>
      <div style={iconCardValueStyle}>{value}</div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #f8fbff 0%, #edf6ff 28%, #d6e9f8 100%)",
  padding: "28px 16px 64px",
  position: "relative",
  overflow: "hidden",
  fontFamily: "'Yu Gothic UI', 'Hiragino Sans', sans-serif",
};

const fogTopStyle = {
  position: "absolute",
  inset: 0,
  background: "radial-gradient(circle at 50% 10%, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.6) 30%, rgba(255,255,255,0) 62%)",
  pointerEvents: "none",
};

const leafGlowLeftStyle = {
  position: "absolute",
  left: "-50px",
  bottom: "-30px",
  width: "430px",
  height: "280px",
  background: "radial-gradient(circle at 18% 82%, rgba(191,219,254,0.85) 0%, rgba(191,219,254,0.42) 26%, rgba(191,219,254,0.12) 52%, rgba(191,219,254,0) 72%)",
  pointerEvents: "none",
  filter: "blur(3px)",
};

const leafGlowRightStyle = {
  position: "absolute",
  right: "-50px",
  bottom: "-30px",
  width: "430px",
  height: "280px",
  background: "radial-gradient(circle at 82% 82%, rgba(191,219,254,0.85) 0%, rgba(191,219,254,0.42) 26%, rgba(191,219,254,0.12) 52%, rgba(191,219,254,0) 72%)",
  pointerEvents: "none",
  filter: "blur(3px)",
};

const leafClusterLeftStyle = {
  position: "absolute",
  left: "-10px",
  bottom: "10px",
  width: "230px",
  height: "160px",
  background:
    "radial-gradient(circle at 12% 88%, rgba(151,213,178,0.38) 0 10px, transparent 11px), radial-gradient(circle at 18% 80%, rgba(151,213,178,0.32) 0 12px, transparent 13px), radial-gradient(circle at 26% 88%, rgba(151,213,178,0.34) 0 13px, transparent 14px), radial-gradient(circle at 34% 80%, rgba(151,213,178,0.28) 0 12px, transparent 13px), radial-gradient(circle at 42% 88%, rgba(151,213,178,0.34) 0 14px, transparent 15px), radial-gradient(circle at 52% 80%, rgba(151,213,178,0.3) 0 13px, transparent 14px), radial-gradient(circle at 62% 88%, rgba(151,213,178,0.34) 0 14px, transparent 15px), radial-gradient(circle at 74% 82%, rgba(151,213,178,0.24) 0 12px, transparent 13px)",
  opacity: 0.8,
  pointerEvents: "none",
};

const leafClusterRightStyle = {
  position: "absolute",
  right: "-10px",
  bottom: "10px",
  width: "230px",
  height: "160px",
  background:
    "radial-gradient(circle at 88% 88%, rgba(151,213,178,0.38) 0 10px, transparent 11px), radial-gradient(circle at 82% 80%, rgba(151,213,178,0.32) 0 12px, transparent 13px), radial-gradient(circle at 74% 88%, rgba(151,213,178,0.34) 0 13px, transparent 14px), radial-gradient(circle at 66% 80%, rgba(151,213,178,0.28) 0 12px, transparent 13px), radial-gradient(circle at 58% 88%, rgba(151,213,178,0.34) 0 14px, transparent 15px), radial-gradient(circle at 48% 80%, rgba(151,213,178,0.3) 0 13px, transparent 14px), radial-gradient(circle at 38% 88%, rgba(151,213,178,0.34) 0 14px, transparent 15px), radial-gradient(circle at 26% 82%, rgba(151,213,178,0.24) 0 12px, transparent 13px)",
  opacity: 0.8,
  pointerEvents: "none",
};

const containerStyle = {
  maxWidth: "1040px",
  margin: "0 auto",
  position: "relative",
  zIndex: 2,
};

const headerStyle = {
  display: "flex",
  justifyContent: "center",
  marginBottom: "18px",
};

const titleRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const logoStyle = {
  fontSize: "58px",
  lineHeight: 1,
};

const titleStyle = {
  margin: 0,
  fontSize: "64px",
  fontWeight: 800,
  lineHeight: 1,
  color: "#0f172a",
  letterSpacing: "0.01em",
};

const titleUnderlineStyle = {
  height: "4px",
  borderRadius: "999px",
  background: "#b9e3fb",
  marginTop: "10px",
};

const mainCardStyle = {
  background: "rgba(255,255,255,0.92)",
  border: "1px solid #dce8f2",
  borderRadius: "18px",
  boxShadow: "0 12px 30px rgba(148,163,184,0.14)",
  padding: "22px",
  marginBottom: "18px",
};

const formRow1Style = {
  display: "grid",
  gridTemplateColumns: "2fr 1.15fr 1fr",
  gap: "12px",
  marginBottom: "12px",
};

const formRow2Style = {
  display: "grid",
  gridTemplateColumns: "1fr 1.55fr 1fr",
  gap: "12px",
  marginBottom: "12px",
};

const formRow3Style = {
  display: "grid",
  gridTemplateColumns: "1fr 1.45fr 1.45fr",
  gap: "12px",
  alignItems: "center",
  marginBottom: "18px",
};

const inputStyle = {
  height: "48px",
  borderRadius: "10px",
  border: "1px solid #d5dee8",
  background: "#fff",
  color: "#334155",
  padding: "0 16px",
  fontSize: "15px",
  boxSizing: "border-box",
};

const rightControlsStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
};

const checkboxLabelStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  fontWeight: 800,
  color: "#1f2937",
  fontSize: "15px",
};

const fileButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: "42px",
  padding: "0 16px",
  borderRadius: "10px",
  border: "1px solid #d5dee8",
  background: "#fff",
  color: "#334155",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const buttonCenterRowStyle = {
  display: "flex",
  justifyContent: "center",
  gap: "10px",
};

const primaryButtonStyle = {
  height: "40px",
  padding: "0 20px",
  borderRadius: "10px",
  border: "1px solid #38bdf8",
  background: "#38bdf8",
  color: "#fff",
  fontWeight: 800,
  fontSize: "14px",
  cursor: "pointer",
};

const softButtonStyle = {
  height: "40px",
  padding: "0 18px",
  borderRadius: "10px",
  border: "1px solid #d5dee8",
  background: "#fff",
  color: "#374151",
  fontWeight: 700,
  fontSize: "14px",
  cursor: "pointer",
};

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "14px",
  marginBottom: "18px",
};

const summaryCardStyle = {
  background: "rgba(255,255,255,0.92)",
  border: "1px solid #dce8f2",
  borderRadius: "18px",
  boxShadow: "0 10px 24px rgba(148,163,184,0.10)",
  padding: "24px 10px",
  textAlign: "center",
};

const summaryTitleStyle = {
  fontSize: "19px",
  fontWeight: 800,
  color: "#111827",
  marginBottom: "10px",
};

const summaryValueStyle = {
  fontSize: "24px",
  fontWeight: 700,
  color: "#0f172a",
};

const filterRowStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  marginBottom: "16px",
};

const filterSelectStyle = {
  height: "40px",
  borderRadius: "10px",
  border: "1px solid #d5dee8",
  background: "rgba(255,255,255,0.95)",
  color: "#374151",
  padding: "0 12px",
  fontSize: "14px",
};

const filterButtonStyle = {
  height: "40px",
  borderRadius: "10px",
  border: "1px solid #d5dee8",
  background: "rgba(255,255,255,0.95)",
  color: "#374151",
  padding: "0 14px",
  fontSize: "14px",
  fontWeight: 700,
  cursor: "pointer",
};

const filterInputStyle = {
  height: "40px",
  minWidth: "180px",
  borderRadius: "10px",
  border: "1px solid #d5dee8",
  background: "rgba(255,255,255,0.95)",
  color: "#374151",
  padding: "0 12px",
  fontSize: "14px",
};

const iconSummaryPanelStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  background: "rgba(255,255,255,0.94)",
  border: "1px solid #d9e5f0",
  borderRadius: "16px",
  boxShadow: "0 10px 24px rgba(148,163,184,0.10)",
  overflow: "hidden",
  marginBottom: "18px",
};

const iconCardStyle = {
  textAlign: "center",
  padding: "18px 12px",
};

const iconCardTopStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "12px",
  marginBottom: "6px",
};

const iconStyle = {
  fontSize: "38px",
  lineHeight: 1,
};

const iconCardTitleStyle = {
  fontSize: "18px",
  fontWeight: 800,
  color: "#111827",
};

const iconCardValueStyle = {
  fontSize: "22px",
  fontWeight: 700,
  color: "#111827",
};

const tablePanelStyle = {
  background: "#ffffff",
  border: "1px solid #d9e5f0",
  borderRadius: "16px",
  boxShadow: "0 10px 24px rgba(148,163,184,0.10)",
  overflow: "hidden",
  minHeight: "320px",
};

const tableTopBarStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "14px",
  borderBottom: "1px solid #e8eef5",
  flexWrap: "wrap",
  background: "#ffffff",
};

const bluePillStyle = {
  height: "36px",
  padding: "0 14px",
  borderRadius: "8px",
  border: "1px solid #3b82f6",
  background: "#3b82f6",
  color: "#fff",
  fontWeight: 800,
};

const miniSelectStyle = {
  height: "36px",
  borderRadius: "8px",
  border: "1px solid #d5dee8",
  background: "#fff",
  color: "#374151",
  padding: "0 10px",
  fontSize: "14px",
};

const searchGroupStyle = {
  display: "flex",
  alignItems: "center",
};

const searchInputStyle = {
  height: "36px",
  borderRadius: "8px 0 0 8px",
  border: "1px solid #d5dee8",
  borderRight: "none",
  background: "#fff",
  color: "#374151",
  padding: "0 12px",
  fontSize: "14px",
  minWidth: "180px",
};

const searchButtonStyle = {
  height: "36px",
  borderRadius: "0 8px 8px 0",
  border: "1px solid #d5dee8",
  background: "#fff",
  padding: "0 12px",
  cursor: "pointer",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#ffffff",
};

const thStyle = {
  background: "#f8fbfd",
  color: "#334155",
  fontSize: "14px",
  fontWeight: 800,
  textAlign: "left",
  padding: "16px 14px",
  borderBottom: "1px solid #e8eef5",
};

const tdStyle = {
  padding: "16px 14px",
  fontSize: "14px",
  color: "#111827",
  borderBottom: "1px solid #eef3f8",
  background: "#ffffff",
};

const emptyCellStyle = {
  textAlign: "center",
  padding: "56px 14px",
  color: "#6b7280",
  fontSize: "15px",
  background: "#ffffff",
  height: "160px",
};

const actionWrapStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "8px",
};

const confirmButtonStyle = {
  height: "32px",
  padding: "0 14px",
  borderRadius: "7px",
  border: "1px solid #38bdf8",
  background: "#38bdf8",
  color: "#fff",
  fontSize: "13px",
  fontWeight: 800,
  cursor: "pointer",
};

const deleteButtonStyle = {
  height: "32px",
  padding: "0 14px",
  borderRadius: "7px",
  border: "1px solid #fca5a5",
  background: "#f87171",
  color: "#fff",
  fontSize: "13px",
  fontWeight: 800,
  cursor: "pointer",
};

export default function App() {
  const isMobile = window.innerWidth < 700;
  return isMobile ? <MobileApp /> : <DesktopApp />;
}

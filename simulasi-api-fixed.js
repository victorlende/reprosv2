const express = require("express");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json({ limit: "1mb" }));

// --- MOCK DATA ---
const sampleByPrimaryCode = {
    // Mock data for PBB (180V42)
    "180V42": {
        proccode: "180V42,180E10",
        transdate: "17/12/25", // Default, will be overwritten by request
        status: "SUKSES",
        source: "psw1",
        xdatatemp: [
            {
                Wisocode: "210",
                Wdatepost: "17/12/25",
                Wtxtime: "0",
                Wtxcode: "100",
                Wbrnchcode: "001",
                Wauthotel: "USER01",
                Wtellid: "TELL01",
                Wtxseqnum: "100001",
                Wtelseqnum: "1",
                WRemoteAccNo: "1234567890",
                Wtoaccno: "0987654321",
                Wccycode: "IDR",
                Wactname: "TEST ACCOUNT",
                Wpbbalnc: "1000000",
                Wavlbalnc: "1000000",
                Wtxamount: "50000",
                Wchqnumber: "0",
                Wlinepb: "1",
                Wstatproc: "00",
                Wproccode: "180V42",
                Wresponcode: "00",
                Wwithpassbook: "Y",
                // Extended attributes matching existing format
                Wsavdate: ["0", "?", "?", "?", "?"],
                Wsavtxtype: ["?", "?", "?", "?", "?"],
                Wsavamount: ["0", "0", "0", "0", "0"],
                Wsavtlrid: ["?", "?", "?", "?", "?"],
                Wsavlinepb: ["0", "0", "0", "0", "0"],
                Wsavpbbal: ["0", "0", "0", "0", "0"],
                Wfirstdata: ["?", "RESP", "000000000000", "?", "0", "0", "?", "?", "6010", "?"],
                Wseconddata: ["TELLER", "0", "RESP-180V42", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "000000", "?", "?", "@MBARESP#"],
                "av$WextcharA": ["?", "?"],
                "av$WextcharB": ["?", "?"],
                Wtransdate: "17/12/25",
                Wactamount: "50000",
                Wtranstime: "103000",
                Wtermid: "TERM01",
                Wprodtype: "2",
                Wnarrative: "PEMBAYARAN PBB",
                Wnarrativepsw1: "PBB LUNAS",
                Wsendfile: "?",
                Wsubtype: "?",
                Wsendbranch: "001",
                atmlongdata: "PEMBAYARAN PBB TAHUN 2025"
            },
            {
                Wisocode: "210",
                Wdatepost: "17/12/25",
                Wtxtime: "0",
                Wtxcode: "100",
                Wbrnchcode: "001",
                Wauthotel: "USER01",
                Wtellid: "TELL01",
                Wtxseqnum: "100002",
                Wtelseqnum: "2",
                WRemoteAccNo: "1234567891",
                Wtoaccno: "0987654322",
                Wccycode: "IDR",
                Wactname: "TEST ACCOUNT 2",
                Wpbbalnc: "2000000",
                Wavlbalnc: "2000000",
                Wtxamount: "75000",
                Wchqnumber: "0",
                Wlinepb: "1",
                Wstatproc: "00",
                Wproccode: "180V42",
                Wresponcode: "00",
                Wwithpassbook: "Y",
                Wsavdate: ["0", "?", "?", "?", "?"],
                Wsavtxtype: ["?", "?", "?", "?", "?"],
                Wsavamount: ["0", "0", "0", "0", "0"],
                Wsavtlrid: ["?", "?", "?", "?", "?"],
                Wsavlinepb: ["0", "0", "0", "0", "0"],
                Wsavpbbal: ["0", "0", "0", "0", "0"],
                Wfirstdata: ["?", "RESP", "000000000000", "?", "0", "0", "?", "?", "6010", "?"],
                Wseconddata: ["TELLER", "0", "RESP-180V42-2", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "000000", "?", "?", "@MBARESP#"],
                "av$WextcharA": ["?", "?"],
                "av$WextcharB": ["?", "?"],
                Wtransdate: "17/12/25",
                Wactamount: "75000",
                Wtranstime: "103500",
                Wtermid: "TERM01",
                Wprodtype: "2",
                Wnarrative: "PEMBAYARAN PBB 2",
                Wnarrativepsw1: "PBB LUNAS",
                Wsendfile: "?",
                Wsubtype: "?",
                Wsendbranch: "001",
                atmlongdata: "PEMBAYARAN PBB TAHUN 2025"
            }
        ]
    },
    // Existing samples preserved...
    RESP05: {
        proccode: "RESP05,RESPX1",
        transdate: "18/12/25",
        status: "SUKSES",
        source: "psw1",
        xdatatemp: [] // ... (shortened for brevity, existing logic covers this)
    }
};

const PROCCODE_GROUPS = {
    PBB: new Set(["180V42", "180E10"]),
    NINE_PD: new Set(["180V50", "180G18"])
};

const DATA_HEADERS = {
    PBB: { date: "TANGGAL TRANSAKSI", source: "ID CHANNEL" },
    NINE_PD: { date: "Tanggal Transaksi", source: "Channel" }
};

function parseDelimitedFile(filePath, delimiter = "|") {
    try {
        if (!fs.existsSync(filePath)) return []; // Safety check
        const raw = fs.readFileSync(filePath, "utf8");
        const lines = raw.split(/\r?\n/).filter((line) => line.trim() !== "");
        if (lines.length === 0) return [];

        const headers = lines[0].split(delimiter).map((header) => header.trim());
        const rows = [];

        for (const line of lines.slice(1)) {
            const parts = line.split(delimiter);
            while (parts.length < headers.length) parts.push("");
            const row = {};
            headers.forEach((header, index) => {
                row[header] = (parts[index] ?? "").trim();
            });
            rows.push(row);
        }
        return rows;
    } catch (error) {
        console.warn(`Gagal membaca data file ${filePath}: ${error.message}`);
        return [];
    }
}

const pbbData = parseDelimitedFile(path.join(__dirname, "pbb.txt"));
const ninePdData = parseDelimitedFile(path.join(__dirname, "9pd.txt"));

function formatTransdate(input) {
    if (typeof input !== "string") return null;
    const isoMatch = /^\d{4}-\d{2}-\d{2}$/.test(input);
    if (isoMatch) {
        const [year, month, day] = input.split("-");
        return `${day}/${month}/${year.slice(2)}`;
    }
    return input;
}

function normalizeDate(input) {
    return formatTransdate(input) ?? input;
}

function buildAuthHash(body) {
    const payload = {
        proccode: body?.proccode ?? "",
        transdate: body?.transdate ?? "",
        psw: body?.psw ?? body?.source ?? ""
    };
    return crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

function cloneResponse(response) {
    return JSON.parse(JSON.stringify(response));
}

function resolveGroupForProccode(proccode) {
    if (typeof proccode !== "string") return null;
    const parts = proccode.split(",").map((part) => part.trim()).filter(Boolean);
    for (const code of parts) {
        if (PROCCODE_GROUPS.PBB.has(code)) return "PBB";
        if (PROCCODE_GROUPS.NINE_PD.has(code)) return "NINE_PD";
    }
    return null;
}

function buildFileResponse({ proccode, transdate, source }) {
    const group = resolveGroupForProccode(proccode);
    if (!group) return null;

    const headers = DATA_HEADERS[group];
    const rows = group === "PBB" ? pbbData : ninePdData;
    const normalizedDate = normalizeDate(transdate);
    const sourceValue = typeof source === "string" ? source.trim() : "";

    const filtered = rows.filter((row) => {
        if (!normalizedDate || row[headers.date] !== normalizedDate) return false;
        if (sourceValue && sourceValue !== "psw1" && row[headers.source] !== sourceValue) return false;
        return true;
    });

    return {
        proccode,
        transdate: normalizedDate ?? transdate,
        status: "SUKSES",
        source: sourceValue || "psw1",
        xdatatemp: filtered
    };
}

function findResponse(proccode) {
    if (typeof proccode !== "string" || proccode.trim() === "") return null;
    const trimmed = proccode.trim();

    // Exact match
    if (sampleByPrimaryCode[trimmed]) return cloneResponse(sampleByPrimaryCode[trimmed]);

    // Partial/Multiple match
    const parts = trimmed.split(",").map(p => p.trim());
    const matchKey = Object.keys(sampleByPrimaryCode).find(key => parts.includes(key));

    if (matchKey) return cloneResponse(sampleByPrimaryCode[matchKey]);

    return null;
}

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.post(["/", "/psw"], (req, res) => {
    const { proccode, transdate, psw, source } = req.body || {};

    if (!proccode || !transdate) {
        return res.status(400).json({
            success: false,
            message: "proccode dan transdate wajib diisi"
        });
    }

    const authHeader = req.get("authorization");
    if (authHeader) {
        const expected = buildAuthHash({ proccode, transdate, psw, source });
        // Note: In strict mode, you might enforce equality. 
        // For simulation, we log warning if mismatch but usually proceed or block depending on requirements.
        // Preserving original logic:
        if (authHeader !== expected) {
            return res.status(401).json({
                success: false,
                message: "Authorization tidak valid"
            });
        }
    }

    // 1. Try to get data from text files first
    let responseData = buildFileResponse({
        proccode,
        transdate,
        source: source ?? psw
    });

    // 2. CHECK: If text file returned empty data, try to fallback to hardcoded mock data
    if (responseData && (!responseData.xdatatemp || responseData.xdatatemp.length === 0)) {
        const mock = findResponse(proccode);
        if (mock) {
            responseData = mock;
            responseData.transdate = formatTransdate(transdate) || transdate;
            // Ensure date inside xdatatemp matches
            if (responseData.xdatatemp) {
                responseData.xdatatemp.forEach(row => {
                    row.Wdatepost = responseData.transdate;
                    row.Wtransdate = responseData.transdate;
                });
            }
            // Ensure correct proccode is reflected if we matched by primary key
            responseData.proccode = proccode;
        }
    } else if (!responseData) {
        // No file group found, try direct mock find
        const mock = findResponse(proccode);
        if (mock) {
            responseData = mock;
        }
    }

    // 3. Construct Final Response
    if (!responseData) {
        // Absolutely no data found
        return res.json({
            proccode,
            transdate: formatTransdate(transdate) ?? transdate,
            status: "SUKSES",
            source: source ?? psw ?? "psw1",
            xdatatemp: []
        });
    }

    // Ensure final metadata alignment
    const formattedDate = formatTransdate(transdate);
    if (formattedDate) {
        responseData.transdate = formattedDate;
        responseData.xdatatemp?.forEach((row) => {
            if (row.Wdatepost) row.Wdatepost = formattedDate;
            if (row.Wtransdate) row.Wtransdate = formattedDate;
        });
    }

    if (source || psw) {
        responseData.source = source ?? psw;
    }

    res.json(responseData);
});

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, () => {
    console.log(`Simulasi PSW API FIXED berjalan di port ${port}`);
});

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ApiSimulatorController extends Controller
{
    public function simulate(Request $request)
    {
        $proccode = $request->input('proccode', '');
        $transdate = $request->input('transdate', '');
        $psw = $request->input('psw', '');

        // Simulasi delay seperti API asli
        usleep(500000); // 0.5 detik delay

        // Data template berdasarkan proccode
        if (str_contains($proccode, '180V82') || str_contains($proccode, '180G12')) {
            return response()->json($this->getPajakAirTanahData($proccode, $transdate, $psw));
        } elseif (str_contains($proccode, '180V42') || str_contains($proccode, '180E10')) {
            return response()->json($this->getPbbData($proccode, $transdate, $psw));
        } else {
            return response()->json($this->getDefaultData($proccode, $transdate, $psw));
        }
    }

    private function getPajakAirTanahData($proccode, $transdate, $psw)
    {
        $items = [];
        $count = rand(2, 5);

        for ($i = 0; $i < $count; $i++) {
            $items[] = [
                "Wisocode" => "210",
                "Wdatepost" => $transdate,
                "Wtxtime" => "0",
                "Wtxcode" => "?",
                "Wbrnchcode" => "0",
                "Wauthotel" => "?",
                "Wtellid" => "001001",
                "Wtxseqnum" => rand(20000000, 20999999),
                "Wtelseqnum" => "0",
                "WRemoteAccNo" => "BNTT" . rand(1000, 9999),
                "Wtoaccno" => "?",
                "Wccycode" => "360",
                "Wactname" => "?",
                "Wpbbalnc" => "0",
                "Wavlbalnc" => "0",
                "Wtxamount" => rand(100000, 999999),
                "Wchqnumber" => "?",
                "Wlinepb" => "0",
                "Wstatproc" => "00",
                "Wproccode" => explode(',', $proccode)[0],
                "Wresponcode" => "00",
                "Wwithpassbook" => "?",
                "Wsavdate" => ["0", "?", "?", "?", "?"],
                "Wsavtxtype" => ["?", "?", "?", "?", "?"],
                "Wsavamount" => ["0", "0", "0", "0", "0"],
                "Wsavtlrid" => ["?", "?", "?", "?", "?"],
                "Wsavlinepb" => ["0", "0", "0", "0", "0"],
                "Wsavpbbal" => ["0", "0", "0", "0", "0"],
                "Wfirstdata" => [
                    "?",
                    "BNTT" . rand(1000, 9999),
                    sprintf("%012d", rand(1, 999999)),
                    "?",
                    "0000000",
                    "1300000",
                    "?",
                    "?",
                    "6010",
                    "?"
                ],
                "Wseconddata" => [
                    "TELLER",
                    "85000",
                    sprintf("%010d", rand(1000000000, 9999999999)),
                    "?", "?", "?", "?", "?", "?", "",
                    "05PT. FLORES TIRTA RANAKA     ",
                    "    2025-11-01                ",
                    "", "",
                    "      2025-11-30              ",
                    "        4.1.01.12.01.0001     ",
                    "000000",
                    "?", "?",
                    "@MBAPBB#"
                ],
                "av\$WextcharA" => ["?", "?"],
                "av\$WextcharB" => ["?", "?"],
                "Wtransdate" => $transdate,
                "Wactamount" => "0",
                "Wtranstime" => rand(10000, 99999),
                "Wtermid" => rand(1000, 9999),
                "Wprodtype" => "2",
                "Wnarrative" => sprintf("%09d", rand(100000000, 999999999)),
                "Wnarrativepsw1" => sprintf("%010d", rand(1000000000, 9999999999)),
                "Wsendfile" => "?",
                "Wsubtype" => "?",
                "Wsendbranch" => "4033",
                "atmlongdata" => "VI105V3005312001124250003598                      KAB. MANGGARAI                                    PAJAK AIR TANAH                                   0                               CFB3510CE9FE779B0000000000000000AE7914844F36423D93EAD2A863D08074FOXD1DDR9TS1N6L9                9999123100000000000046015200000000000460152000000000004601520000000000000000000000000000000000000000000PT. FLORES TIRTA RANAKA  KEL. GOLO DUKAL, KEC. LAN-        GOLO DUKAL               LANGKE REMBONG           -                        0000-KEL. GOLO DUKAL, KEC. LAN-        5312081007               5312081                  -                        000000000000                        P100014045312       4250003598          "
            ];
        }

        return [
            "proccode" => $proccode,
            "transdate" => $transdate,
            "status" => "SUKSES",
            "source" => $psw,
            "xdatatemp" => $items
        ];
    }

    private function getPbbData($proccode, $transdate, $psw)
    {
        $items = [];
        $count = rand(2, 5);

        for ($i = 0; $i < $count; $i++) {
            $items[] = [
                "Wisocode" => "210",
                "Wdatepost" => $transdate,
                "Wtxtime" => "0",
                "Wtxcode" => "?",
                "Wbrnchcode" => "0",
                "Wauthotel" => "?",
                "Wtellid" => "003224",
                "Wtxseqnum" => rand(20000000, 20999999),
                "Wtelseqnum" => "0",
                "WRemoteAccNo" => "BNTT" . rand(1000, 9999),
                "Wtoaccno" => "?",
                "Wccycode" => "360",
                "Wactname" => "?",
                "Wpbbalnc" => "0",
                "Wavlbalnc" => "0",
                "Wtxamount" => rand(100000, 999999),
                "Wchqnumber" => "?",
                "Wlinepb" => "0",
                "Wstatproc" => "00",
                "Wproccode" => explode(',', $proccode)[0],
                "Wresponcode" => "00",
                "Wwithpassbook" => "?",
                "Wsavdate" => ["0", "?", "?", "?", "?"],
                "Wsavtxtype" => ["?", "?", "?", "?", "?"],
                "Wsavamount" => ["0", "0", "0", "0", "0"],
                "Wsavtlrid" => ["5310", "?", "?", "?", "?"],
                "Wsavlinepb" => ["0", "0", "0", "0", "0"],
                "Wsavpbbal" => ["0", "0", "0", "0", "0"],
                "Wfirstdata" => [
                    "?",
                    "2025",
                    sprintf("%012d", rand(1, 999999)),
                    "?",
                    "1300000",
                    "1300000",
                    "?",
                    "?",
                    "6010",
                    "?"
                ],
                "Wseconddata" => [
                    "TELLER",
                    "85000",
                    "VI105V3005310000202025531002400100100720               ",
                    "?", "?", "?", "?", "?",
                    "0010000000000000236500",
                    "112025-04-25                      2025-04-25                      300                             89                              069                             024                             184200000                       62300000                        246500000                       10000000                        236500000                       ",
                    "?", "?", "?", "?", "?", "?",
                    rand(100000, 999999),
                    "Anda masih memiliki tunggakan tahun :  2013  2012  2011  2010  2008 ",
                    "?",
                    "@MBAPBB#"
                ],
                "av\$WextcharA" => ["?", "?"],
                "av\$WextcharB" => ["?", "?"],
                "Wtransdate" => $transdate,
                "Wactamount" => rand(100000, 999999),
                "Wtranstime" => rand(10000, 99999),
                "Wtermid" => rand(1000, 9999),
                "Wprodtype" => "2",
                "Wnarrative" => "?",
                "Wnarrativepsw1" => "?",
                "Wsendfile" => "?",
                "Wsubtype" => "?",
                "Wsendbranch" => "4040",
                "atmlongdata" => "VI105V3005310000202025531002400100100720          KAB ENDE                                          PBB                                               0                               35939C04B44B467BB66E2EED46DBF9CFB80F3942F90682A00000000000000000406E8C15D7FF49C9B90C8D50CD0B19202025123100000000000023650000000000000236500000000000002365000000000000000000000000000000000000000000000YOHANES K. BRUNO WARA    JL EL TARI               /        MAUTAPAGA                                         E N D E                  00000JL EL TARI               /        MAUTAPAGA                ENDE TIMUR               E N D E                  "
            ];
        }

        return [
            "proccode" => $proccode,
            "transdate" => $transdate,
            "status" => "SUKSES",
            "source" => $psw,
            "xdatatemp" => $items
        ];
    }

    private function getDefaultData($proccode, $transdate, $psw)
    {
        return [
            "proccode" => $proccode,
            "transdate" => $transdate,
            "status" => "SUKSES",
            "source" => $psw,
            "xdatatemp" => [
                [
                    "Wisocode" => "210",
                    "Wdatepost" => $transdate,
                    "Wtxseqnum" => rand(20000000, 20999999),
                    "WRemoteAccNo" => "BNTT" . rand(1000, 9999),
                    "Wtxamount" => rand(100000, 999999),
                    "Wproccode" => $proccode,
                    "Wresponcode" => "00",
                    "Wtransdate" => $transdate,
                    "Wnarrative" => "Simulasi transaksi",
                    "message" => "Data simulasi untuk proccode: " . $proccode
                ]
            ]
        ];
    }
}

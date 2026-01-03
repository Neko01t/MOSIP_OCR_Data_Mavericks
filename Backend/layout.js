const LAYOUTS = {
// Auto Detect
// Aadhaar Card (UIDAI)
// Passport (India)
// Voter ID (Election Commission)
// Driving License (State Issued)
// MOSIP Sample ID
  //Verification Screen:
  //MATCH/ PARTIAL MATCH/ MISMATCH
// Handwritten Enrollment Form
// Other / Unknown Document

    'tier1_aadhar': {
        name: 'Aadhaar Card (UIDAI)',
        keywords: [
            'Government of India', 'UID', 'uidai', 'aadhar', 'yob',
            'Hi', 'Male', 'Unique Identification Authority',
            'Enrolment No', 'To', 'Toa', 'VALE', '008', 'ward', 'Flat',
            'Governmentof'
        ],
        fields: {
            id_number: {
                labels: ['aadhar number', 'uid'],
                regex: /\b(\d{4}\s\d{4}\s\d{4})\b/
            },
            name: {
                labels: ['name'],
                regex: /(?:To|Toa|Name|नाम|Hi|Government\s*of\s*India|Governmentof\s*India)\s*[:\-\.]*\s*(?:[^\n]*\n){0,4}\s*([A-Za-z\s\.]+)(?=\s*(?:S\/O|C\/O|W\/O|DOB|Birth|Enrolment|ward|Flat|Plot|No\.|Galli|008|ool|जन्म))/i
            },
            dob: {
                labels: ['dob', 'date of birth', 'yob'],
                regex: /(?:DOB|Date of Birth|YOB|जन्म\s*tithi|उप\s*तिथि|ए008|008|तारीख|ool)\s*[:\-\./0-9A-Za-z]*\s*([\d\/\-\s\.]+)/i
            },
            gender: {
                labels: ['gender'],
                regex: /\b(MALE|FEMALE|TRANSGENDER|पुरुष|महिला|VALE|FEVALE)\b/i
            },
            address: {
                labels: ['address'],
                regex: /(?:Address|To|Pata|S\/O)[\s\S]*?((?:S\/O|C\/O|W\/O|Address|Flat|Plot|H\.No|No\.|आत्मज|Galli)[\s\S]+?)(?=\s*\-?\s*\d{6}|Maharashtra|Uttar|www|Entities|Help)/i
            }
        }
    },

    'tier1_passport': {
        name: ' Passport (India)',
        keywords: ['republic of india', 'passport', 'given name', 'date of expiry'],
        fields: {
            passport_number: { labels: ['passport no'], regex: /(?:nom|no)\s*([A-Z0-9]{8})/i },
            surname: { labels: ['surname'], regex: /P<<([A-Z]+)<<|Surname[\s\S]*?\n\s*([A-Z]+)/i },
            given_name: { labels: ['given name'], regex: /P<<[A-Z]+<<([A-Z]+?)(?=[<L])/ },
            dob: { labels: ['date of birth', 'dob'], regex: /Date of Birth[\s\S]*?(\d{2}\/\d{2}\/\d{4})/i },
            sex: { labels: ['sex'], regex: /(?:Sex|Date of Birth)[\s\S]*?\s+([MF])\b/i },
            place_of_birth: { labels: ['place of birth'], regex: /Place of Birth[\s\S]*?\n[^A-Z]*([A-Z][A-Z\s,]+)/i },
            date_of_expiry: { labels: ['date of expiry'], regex: /Date of Expiry[\s\S]*?\d{2}\/\d{2}\/\d{4}\s+(\d{2}\/\d{2}\/\d{4})/i },
            mrz_line_1: { labels: ['mrz top'], regex: /(P<[A-Z<]+)/ },
            mrz_line_2: { labels: ['mrz bottom'], regex: /([A-Z0-9<]{10,}\d+)/ }
        }
    },

    'tier1_mosip': {
        name: 'MOSIP Sample ID',
        keywords: ['mosip', 'digital', 'identity', 'lab', 'id card', 'sample'],
        fields: {
            full_name: { labels: ['full name', 'name'], regex: /(?:Full\s*)?Name\s*[:\-\.]*\s*([A-Za-z\s\.]+?)(?=\s*(?:Date|DOB|ID|Gender|$))/i },
            dob: { labels: ['date of birth', 'dob'], regex: /(?:Date\s*of\s*Birth|DOB)\s*[:\-\.]*\s*([\d\/]+)/i },
            id_number: { labels: ['id number'], regex: /ID\s*Number\s*[:\-\.]*\s*([A-Z0-9\-]+)/i },
            gender: { labels: ['gender'], regex: /Gender\s*[:\-\.]*\s*([A-Za-z]+)/i },
            address: { labels: ['address'], regex: /Address\s*[:\-\.]*\s*([\s\S]+?)(?=\s*(?:District|Organization|Tip|$))/i }
        }
    },

    'tier2_pan': {
        name: 'PAN Card (Income Tax Dept)',
        keywords: ['Income Tax Department', 'Permanent Account Number', 'GOVT OF INDIA', 'Pancard', 'Tax', 'INCOME', 'AYAKAR', 'NILPS'],
        fields: {
            id_number: {
                labels: ['pan', 'id'],
                regex: /\b([A-Z]{5}[0-9]{4}[A-Z])\b/
            },
            name: {
                labels: ['name'],
                regex: /(?:Name|नाम)[\s\S]*?[\n:]\s*([A-Z\s\.]+)(?=\n|Father|पिता)/i
            },
            fathers_name: {
                labels: ['father'],
                regex: /(?:Father's\s*Name|पिता\s*का\s*नाम)[\s\S]*?[\n:]\s*([A-Z\s\.]+)(?=\n|Date|DOB|born|जन्म)/i
            },
            dob: {
                labels: ['dob'],
                // Standard DD/MM/YYYY
                regex: /(?:Date\s*of\s*Birth|DOB|जन्म\s*की\s*तारीख)[\s\S]*?(\d{2}\/\d{2}\/\d{4})/i
            }
        }
    },

    'tier2_passport': {
        name: 'Passport (Republic of India) - Non-MRZ',
        keywords: ['republic of india', 'passport', 'surname', 'given name', 'nationality'],
        fields: {
            type: { labels: ['type'], regex: /Type\s*[:\s]*([A-Z])/i },
            country_code: { labels: ['code'], regex: /Code\s*[:\s]*([A-Z]{3})/i },
            id_number: { labels: ['passport no'], regex: /Passport\s*No\s*[:\.]?\s*([A-Z][0-9]{7})/i },
            surname: { labels: ['surname'], regex: /Surname\s*\n\s*([A-Z\s]+)/i },
            given_name: { labels: ['given name'], regex: /Given\s*Name(?:s)?\s*\n\s*([A-Z\s]+)/i },
            dob: { labels: ['date of birth'], regex: /Date\s*of\s*Birth\s*\n\s*([\d\/]+)/i },
            gender: { labels: ['sex', 'gender'], regex: /Sex\s*\n\s*([MF])/i }
        }
    },
    'tier3_voter_id': {
        name: 'Voter ID (Election Commission)',
        keywords: ['election commission', 'elector', 'identity card', 'epic', 'father'],
        fields: {
            id_number: { labels: ['epic no', 'id'], regex: /([A-Z]{3}[0-9]{7})/ },
            name: { labels: ['name', 'elector name'], regex: /(?:Name|Elector's\s*Name)\s*[:\-\.]*\s*([A-Za-z\s\.]+)/i },
            fathers_name: { labels: ['father name', 'husband name'], regex: /(?:Father's|Husband's)\s*Name\s*[:\-\.]*\s*([A-Za-z\s\.]+)/i },
            age_or_dob: { labels: ['age', 'dob'], regex: /(?:Age|Date\s*of\s*Birth)\s*[:\-\.]*\s*([\d\/]+)/i },
            gender: { labels: ['sex', 'gender'], regex: /(?:Sex|Gender)\s*[:\-\.]*\s*([A-Za-z]+)/i }
        }
    },

    'tier3_driving_license': {
        name: 'Driving License (State Issued)',
        keywords: ['driving licence', 'union of india', 'transport department', 'motor vehicles', 'dl no'],
        fields: {
            id_number: { labels: ['dl no', 'license no'], regex: /(?:DL|Licence)\s*(?:No|Number)\s*[:\-\.]*\s*([A-Z0-9\-\s\/]+)/i },
            name: { labels: ['name'], regex: /Name\s*[:\-\.]*\s*([A-Za-z\s\.]+)/i },
            dob: { labels: ['dob'], regex: /(?:DOB|Date of Birth)\s*[:\-\.]*\s*([\d\-\/]+)/i },
            valid_till: { labels: ['valid till', 'validity'], regex: /(?:Valid\s*Till|Validity)\s*[:\-\.]*\s*([\d\-\/]+)/i },
            state: { labels: ['state'], regex: /(GOVT\.\s*OF\s*[A-Z\s]+)/i }
        }
    },

'tier3_handwritten_form': {
    name: 'Handwritten Enrollment Form',
    keywords: ['first name', 'fist mame', 'hsr layout', 'bangalore', 'guemden', 'mame'],
    fields: {
        first_name: {
            labels: ['first name', 'fist mame'],
            regex: /(?:First|Fist)\s*(?:name|mame)\s*[:\-\©️\°\.\*\s]*([\w\u0900-\u097F]+)/i
        },
        last_name: {
            labels: ['last name', 'last mame'],
            regex: /Last\s*(?:name|mame)\s*[:\-\©️\°\.\*\s]*([\w\s\u0900-\u097F]+?)(?=\n|Date|Address)/i
        },
        gender: {
            labels: ['gender', 'guemden', 'cremdun'],
            regex: /(?:Gender|Guemden|Cremdun)\s*[:\-\©️\°\.\*\s]*\b(Male|Female|Other|MALE|FEMALE|TRANSGENDER)\b/i
        },
        dob: {
            labels: ['date of birth', 'date af bicth'],
            regex: /(?:Date\s*(?:of|af)?\s*(?:Birth|Bicth)|Bicth)\s*[:\-\©️\°\.\*\;\s]*([\d]{2}-[\d]{2}-[\d]{4})/i
        },
        address_1: {
            labels: ['address line 1'],
            regex: /(?:Address|Addxers|Lined)\s*(?:Line\s*1|Lived)?\s*[:\-\©️\°\.\*\s]*([\s\S]+?)(?=\n?Address|Live2|City|$)/i
        }
    }
},
    'generic': {
        name: 'Other / Unknown Document',
        keywords: [],
        fields: {
            name: { labels: ['name', 'full name'], regex: /(?:Name|Full Name)[:\s]+([A-Za-z\s]+)/i },
            id_number: { labels: ['id', 'id no'], regex: /(?:ID|License)\s?(?:No|Number)?[:\s]+([A-Z0-9-]+)/i },
            dob: { labels: ['dob', 'date of birth'], regex: /(?:DOB|Date of Birth)[:\s]+([\d/-]+)/i },
            gender: { labels: ['gender'], regex: /Gender[:\s]+([A-Za-z]+)/i },
            address: { labels: ['address'], regex: /Address[:\s]+([\s\S]*?)$/i }
        }
    }
};

module.exports = LAYOUTS;

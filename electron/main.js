const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const url = require("url");
const { channels } = require("../src/shared/constants");
const initDatabase = require("./db/initDatabase");
const db = require("./db/models");
const { autoUpdater } = require("electron-updater");
const Profile = require("./businessLogic/Profile");
const AdministrativeDivision = require("./businessLogic/AdministrativeDivision");
const EnrollmentPeriod = require("./businessLogic/EnrollmentPeriod");
const Subsidy = require("./businessLogic/Subsidy");
const Member = require("./businessLogic/Member");
const EnrollmentRecord = require("./businessLogic/EnrollmentRecord");
const Report = require("./businessLogic/Report");
const readFile = require("fs").readFile;
const writeFile = require("fs").writeFile;
const copyFile = require("fs").copyFile;
const removeFile = require("fs").unlink;
const XLSX = require("xlsx");
const XlsxTemplate = require('xlsx-template');
const { toEthiopian } = require("ethiopian-date");

let mainWindow;

const convertToEthiopianDate = (dateObj) => {
  if (dateObj) {
    try {
      const ethiopianDate = toEthiopian(...dateObj.split("-").map(Number)).join("-")
      return ethiopianDate
    } catch (error) {
      console.log(error)
    }
  }
  else
    return ""
}

function createWindow() {
  const startUrl =
    process.env.ELECTRON_START_URL ||
    url.format({
      pathname: path.join(__dirname, "../index.html"),
      protocol: "file:",
      slashes: true,
    });
  mainWindow = new BrowserWindow({
    minWidth: 1165,
    minHeight: 715,
    width: 1165,
    height: 715,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  mainWindow.removeMenu();
  mainWindow.loadURL(startUrl);
  mainWindow.on("move", function () {
    mainWindow.webContents.send(channels.WINDOW_STATE, mainWindow.isMaximized());
  });
  mainWindow.on("maximize", function () {
    mainWindow.webContents.send(channels.WINDOW_STATE, true);
  });
  mainWindow.on("unmaximize", function () {
    mainWindow.webContents.send(channels.WINDOW_STATE, false);
  });
  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

app.on("ready", function () {
  initDatabase();
  createWindow();
  setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify();
  }, 21000);
});

//app.on("browser-window-created", function () { checkSecurity() })

app.on("window-all-closed", function () {
  app.quit();
});

app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});

//*********** - APPLICATION METHODS - ********************//
ipcMain.on(channels.ACCOUNT_LOCK, (event) => {
  Profile.getProfile()
    .then((result) => {
      if (result.password !== "" && result.password !== null) {
        mainWindow.webContents.send(channels.ACCOUNT_LOCK, true);
      }
    })
    .catch((err) => console.log(err));
});

ipcMain.on(channels.ACCOUNT_LOGIN, (event, accountPassword) => {
  Profile.login(accountPassword)
    .then((result) => {
      if (result.success)
        mainWindow.webContents.send(channels.ACCOUNT_LOCK, false);
      else
        mainWindow.webContents.send(channels.ACCOUNT_LOGIN, result);
    })
    .catch((err) => {
      console.log(err)
      mainWindow.webContents.send(channels.ACCOUNT_LOGIN, { success: false, errorMessage: err });
    });
});

ipcMain.on(channels.APP_INFO, (event) => {
  mainWindow.webContents.send(channels.APP_INFO, app.getVersion());
});

ipcMain.on(channels.MINIMIZE_WINDOW, (event) => {
  mainWindow.minimize();
});

ipcMain.on(channels.MAXIMIZE_WINDOW, (event) => {
  mainWindow.maximize();
});

ipcMain.on(channels.UNMAXIMIZE_WINDOW, (event) => {
  mainWindow.unmaximize();
  mainWindow.setSize(1165, 715);
});

ipcMain.on(channels.CLOSE_APPLICATION, (event) => {
  mainWindow.close();
});

//*********** - AUTO UPDATE METHODS - ********************//

autoUpdater.on("update-available", (info) => {
  const response = {
    type: "Info",
    message: `A new update v${info.version} is available. Downloading now...`,
  };
  mainWindow.webContents.send(channels.SEND_NOTIFICATION, response);
});
autoUpdater.on("update-downloaded", (info) => {
  const response = {
    type: "Info",
    message: `A new update is ready to install. CBHI Enrollment App v${info.version} will be automatically installed on exit`,
  };
  mainWindow.webContents.send(channels.SEND_NOTIFICATION, response);
});

//*********** - WOREDA PROFILE METHODS - ****************//

ipcMain.on(channels.LOAD_PROFILE, (event) => {
  Profile.getProfile()
    .then((result) => {
      mainWindow.webContents.send(channels.LOAD_PROFILE, result);
    })
    .catch((err) => console.log(err));
});

ipcMain.on(channels.CREATE_PROFILE, (event, profileObj) => {
  Profile.addProfile(profileObj)
    .then((response) => {
      mainWindow.webContents.send(channels.SEND_NOTIFICATION, response);
      if (response.type === "Success")
        Profile.getProfile()
          .then((result) => {
            mainWindow.webContents.send(channels.LOAD_PROFILE, result);
          })
          .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

ipcMain.on(channels.UPDATE_PROFILE, (event, profileObj) => {
  Profile.editProfile(profileObj)
    .then((response) => {
      mainWindow.webContents.send(channels.SEND_NOTIFICATION, response);
      if (response.type === "Success")
        Profile.getProfile()
          .then((result) => {
            mainWindow.webContents.send(channels.LOAD_PROFILE, result);
          })
          .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

//*********** - ADMINISTRATIVE DIVISION METHODS - ****************//

ipcMain.on(channels.LOAD_ADMINISTRATIVE_DIVISIONS, (event) => {
  AdministrativeDivision.getAdministrativeDivisions()
    .then((result) => {
      mainWindow.webContents.send(
        channels.LOAD_ADMINISTRATIVE_DIVISIONS,
        result
      );
    })
    .catch((err) => console.log(err));
});

ipcMain.on(channels.LOAD_KEBELE, (event) => {
  AdministrativeDivision.getKebeles()
    .then((result) => {
      mainWindow.webContents.send(channels.LOAD_KEBELE, result);
    })
    .catch((err) => console.log(err));
});

ipcMain.on(channels.CREATE_KEBELE, (event, kebeleObj) => {
  AdministrativeDivision.addKebele(kebeleObj)
    .then((response) => {
      mainWindow.webContents.send(channels.SEND_NOTIFICATION, response);
      if (response.type === "Success")
        AdministrativeDivision.getKebeles()
          .then((result) => {
            mainWindow.webContents.send(channels.LOAD_KEBELE, result);
          })
          .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

ipcMain.on(channels.UPDATE_KEBELE, (event, kebeleObj) => {
  AdministrativeDivision.editKebele(kebeleObj)
    .then((response) => {
      mainWindow.webContents.send(channels.SEND_NOTIFICATION, response);
      if (response.type === "Success")
        AdministrativeDivision.getKebeles()
          .then((result) => {
            mainWindow.webContents.send(channels.LOAD_KEBELE, result);
          })
          .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

ipcMain.on(channels.LOAD_GOTE, (event, parentId) => {
  AdministrativeDivision.getGotes(parentId)
    .then((result) => {
      mainWindow.webContents.send(channels.LOAD_GOTE, result);
    })
    .catch((err) => console.log(err));
});

ipcMain.on(channels.CREATE_GOTE, (event, kebeleObj) => {
  if (kebeleObj.parent === 0) {
    const response = {
      type: "Warning",
      message: "Please select a Kebele from the list first to add a Gote",
    };
    return mainWindow.webContents.send(channels.SEND_NOTIFICATION, response);
  }

  AdministrativeDivision.addGote(kebeleObj)
    .then((response) => {
      mainWindow.webContents.send(channels.SEND_NOTIFICATION, response);
      if (response.type === "Success")
        AdministrativeDivision.getGotes(kebeleObj.parent)
          .then((result) => {
            mainWindow.webContents.send(channels.LOAD_GOTE, result);
          })
          .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

ipcMain.on(channels.UPDATE_GOTE, (event, kebeleObj) => {
  AdministrativeDivision.editGote(kebeleObj)
    .then((response) => {
      mainWindow.webContents.send(channels.SEND_NOTIFICATION, response);
      if (response.type === "Success")
        AdministrativeDivision.getGotes(kebeleObj.parent)
          .then((result) => {
            mainWindow.webContents.send(channels.LOAD_GOTE, result);
          })
          .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

//*********** - ENROLLMENT PERIOD METHODS - ****************//

ipcMain.on(channels.LOAD_ENROLLMENT_PERIOD, (event) => {
  EnrollmentPeriod.getEnrollmentPeriods()
    .then((result) => {
      mainWindow.webContents.send(channels.LOAD_ENROLLMENT_PERIOD, result);
    })
    .catch((err) => console.log(err));
});

ipcMain.on(channels.CREATE_ENROLLMENT_PERIOD, (event, enrollmentPeriodObj) => {
  EnrollmentPeriod.addEnrollmentPeriod(enrollmentPeriodObj)
    .then((response) => {
      mainWindow.webContents.send(channels.SEND_NOTIFICATION, response);
      if (response.type === "Success")
        EnrollmentPeriod.getEnrollmentPeriods()
          .then((result) => {
            mainWindow.webContents.send(
              channels.LOAD_ENROLLMENT_PERIOD,
              result
            );
          })
          .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

ipcMain.on(channels.UPDATE_ENROLLMENT_PERIOD, (event, enrollmentPeriodObj) => {
  EnrollmentPeriod.editEnrollmentPeriod(enrollmentPeriodObj)
    .then((response) => {
      mainWindow.webContents.send(channels.SEND_NOTIFICATION, response);
      if (response.type === "Success")
        EnrollmentPeriod.getEnrollmentPeriods()
          .then((result) => {
            mainWindow.webContents.send(
              channels.LOAD_ENROLLMENT_PERIOD,
              result
            );
          })
          .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

//*********** - SUBSIDY METHODS - ****************//

ipcMain.on(channels.LOAD_SUBSIDIES, (event) => {
  Subsidy.getSubsidies()
    .then((result) => {
      mainWindow.webContents.send(channels.LOAD_SUBSIDIES, result);
    })
    .catch((err) => console.log(err));
});

ipcMain.on(channels.CREATE_SUBSIDY, (event, subsidyObj) => {
  Subsidy.addSubsidy(subsidyObj)
    .then((response) => {
      mainWindow.webContents.send(channels.SEND_NOTIFICATION, response);
      if (response.type === "Success")
        Subsidy.getSubsidies()
          .then((result) => {
            mainWindow.webContents.send(
              channels.LOAD_SUBSIDIES,
              result
            );
          })
          .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

ipcMain.on(channels.UPDATE_SUBSIDY, (event, subsidyObj) => {
  Subsidy.editSubsidy(subsidyObj)
    .then((response) => {
      mainWindow.webContents.send(channels.SEND_NOTIFICATION, response);
      if (response.type === "Success")
        Subsidy.getSubsidies()
          .then((result) => {
            mainWindow.webContents.send(
              channels.LOAD_SUBSIDIES,
              result
            );
          })
          .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

ipcMain.on(channels.REMOVE_SUBSIDY, (event, subsidyId) => {
  Subsidy.removeSubsidy(subsidyId)
    .then((response) => {
      mainWindow.webContents.send(channels.SEND_NOTIFICATION, response);
      if (response.type === "Success")
        Subsidy.getSubsidies()
          .then((result) => {
            mainWindow.webContents.send(
              channels.LOAD_SUBSIDIES,
              result
            );
          })
          .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

//*********** - MEMBERS & BENEFICIARIES METHODS - ****************//

ipcMain.on(channels.LOAD_MEMBER, (event, id) => {
  Member.getMember(id)
    .then((result) => {
      mainWindow.webContents.send(channels.LOAD_MEMBER, result);
    })
    .catch((err) => console.log(err));
});

ipcMain.on(channels.LOAD_MEMBERS, (event, query) => {
  Member.getMembers(query)
    .then((result) => {
      mainWindow.webContents.send(channels.LOAD_MEMBERS, result);
    })
    .catch((err) => console.log(err));
});

ipcMain.on(channels.LOAD_BENEFICIARIES, (event, householdId) => {
  Member.getBeneficiaries(householdId)
    .then((result) => {
      mainWindow.webContents.send(channels.LOAD_BENEFICIARIES, result);
    })
    .catch((err) => console.log(err));
});

ipcMain.on(channels.CREATE_MEMBER, (event, memberObj) => {
  Member.addMember(memberObj)
    .then((response) => {
      mainWindow.webContents.send(channels.SEND_NOTIFICATION, response);
      if (response.type === "Success")
        mainWindow.webContents.send(channels.MEMBER_SUCCESS);
    })
    .catch((err) => console.log(err));
});

ipcMain.on(channels.UPDATE_MEMBER, (event, memberObj) => {
  Member.editMember(memberObj)
    .then((response) => {
      mainWindow.webContents.send(channels.SEND_NOTIFICATION, response);
      if (response.type === "Success")
        mainWindow.webContents.send(channels.MEMBER_SUCCESS);
    })
    .catch((err) => console.log(err));
});

ipcMain.on(channels.REMOVE_MEMBER, (event, memberId) => {
  Member.removeMember(memberId)
    .then((response) => {
      mainWindow.webContents.send(channels.SEND_NOTIFICATION, response);
      if (response.type === "Success")
        mainWindow.webContents.send(channels.MEMBER_REMOVED);
    })
    .catch((err) => console.log(err));
});

ipcMain.on(channels.LOAD_HOUSEHOLD_PAYMENTS, (event, householdId) => {
  EnrollmentRecord.loadHouseholdPayment(householdId)
    .then((result) => {
      mainWindow.webContents.send(channels.SYSTEM_PROGRESS, {
        open: false,
        progressTitle: "Loading Previous Payments...",
        progressValue: 99
      })
      mainWindow.webContents.send(channels.LOAD_HOUSEHOLD_PAYMENTS, result);
    })
    .catch((err) => {
      console.log(err)
    });
});

//*********** - MEMBER RENEWAL METHODS - ****************//

ipcMain.on(channels.CHECK_ACTIVE_PERIOD, (event) => {
  mainWindow.webContents.send(channels.SYSTEM_PROGRESS, {
    open: true,
    progressTitle: "Loading Member Renewal...",
    progressValue: 0
  })
  EnrollmentRecord.checkActiveEnrollmentPeriod().then((result) => {
    if (result.type !== "Success") {
      const response = {
        type: "Warning",
        message: result.message,
      };
      mainWindow.webContents.send(channels.SYSTEM_PROGRESS, {
        open: false,
        progressTitle: "",
        progressValue: 0
      })
      mainWindow.webContents.send(channels.SEND_NOTIFICATION, response);
    }
    mainWindow.webContents.send(channels.CHECK_ACTIVE_PERIOD, result.type === "Success");
  });
});

ipcMain.on(channels.LOAD_MEMBER_RENEWAL, (event, householdId) => {
  EnrollmentRecord.loadNewEnrollmentRecord(householdId).then((result) => {
    mainWindow.webContents.send(channels.LOAD_MEMBER_RENEWAL, result);
    mainWindow.webContents.send(channels.SYSTEM_PROGRESS, {
      open: false,
      progressTitle: "Loading Member Renewal...",
      progressValue: 99
    })
  });
});

ipcMain.on(channels.CREATE_MEMBER_RENEWAL, (event, enrollmentRecordObj) => {
  mainWindow.webContents.send(channels.SYSTEM_PROGRESS, {
    open: true,
    progressTitle: "Saving...",
    progressValue: 0
  })
  EnrollmentRecord.addEnrollmentRecord(enrollmentRecordObj)
    .then((response) => {
      mainWindow.webContents.send(channels.SEND_NOTIFICATION, response);
      mainWindow.webContents.send(channels.SYSTEM_PROGRESS, {
        open: false,
        progressTitle: "Saving...",
        progressValue: 0
      })
      if (response.type === "Success")
        mainWindow.webContents.send(channels.MEMBER_RENEWAL_SUCCESS);
    })
    .catch((err) => console.log(err));
});

ipcMain.on(channels.UPDATE_ENROLLMENT_RECORD, (event, enrollmentRecordObj) => {
  mainWindow.webContents.send(channels.SYSTEM_PROGRESS, {
    open: true,
    progressTitle: "Updating...",
    progressValue: 0
  })
  EnrollmentRecord.updateEnrollmentRecord(enrollmentRecordObj)
    .then((response) => {
      mainWindow.webContents.send(channels.SEND_NOTIFICATION, response);
      mainWindow.webContents.send(channels.SYSTEM_PROGRESS, {
        open: false,
        progressTitle: "Updating...",
        progressValue: 0
      })
      if (response.type === "Success")
        mainWindow.webContents.send(channels.MEMBER_RENEWAL_SUCCESS);
    })
    .catch((err) => console.log(err));
});

ipcMain.on(channels.REMOVE_ENROLLMENT_RECORD, (event, enrollmentRecordId) => {
  mainWindow.webContents.send(channels.SYSTEM_PROGRESS, {
    open: true,
    progressTitle: "Removing...",
    progressValue: 0
  })
  EnrollmentRecord.removeEnrollmentRecord(enrollmentRecordId)
    .then((response) => {
      mainWindow.webContents.send(channels.SEND_NOTIFICATION, response);
      mainWindow.webContents.send(channels.SYSTEM_PROGRESS, {
        open: false,
        progressTitle: "Removing...",
        progressValue: 0
      })
      if (response.type === "Success")
        mainWindow.webContents.send(channels.MEMBER_RENEWAL_SUCCESS);
    })
    .catch((err) => console.log(err));
});

//*********** - EXPORT ENROLLMENT DATA METHODS - ****************//

ipcMain.on(channels.EXPORT_ENROLLMENT, async (event, query) => {
  const workbook = XLSX.utils.book_new();
  const template_name = "CBHI Enrollment Data";
  let allMembersData = await Member.getAllMembers(query);
  allMembersData = allMembersData.map((memberObj) => ({
    "Full Name": memberObj['Members.fullName'],
    "Date Of Birth(YYYY-MM-DD)": convertToEthiopianDate(memberObj['Members.dateOfBirth']),
    "Gender(Male/Female)": memberObj['Members.gender'],
    "Household CBHI Id": memberObj['cbhiId'],
    "Beneficiary CBHI Id": memberObj['Members.cbhiId'],
    "Kebele/Gote": memberObj['AdministrativeDivision.name'],
    "Relationship": memberObj['Members.relationship'],
    "Profession": memberObj['Members.profession'],
    "Enrollment Date (YYYY-MM-DD)": convertToEthiopianDate(memberObj['Members.enrolledDate']),
    "is Household Head (1/0)": memberObj['Members.isHouseholdHead'],
    "Contribution Amount": memberObj['Members.isHouseholdHead'] ? memberObj['contributionAmount'] : "",
    "Registration Fee": memberObj['Members.isHouseholdHead'] ? memberObj['registrationFee'] : "",
    "Additional Beneficiary Fee": memberObj['Members.isHouseholdHead'] ? memberObj['additionalBeneficiaryFee'] : "",
    "Other Fees": memberObj['Members.isHouseholdHead'] ? memberObj['otherFees'] : "",
    "Receipt No": memberObj['Members.isHouseholdHead'] ? memberObj['receiptNo'] : "",
    "Receipt Date": memberObj['Members.isHouseholdHead'] ? memberObj['receiptDate'] ? memberObj['receiptDate'].split(",").map(r => convertToEthiopianDate(r)).join(",") : "" : "",
    "Membership Type": memberObj['Members.isHouseholdHead'] ? memberObj['isPaying'] === null ? "" : memberObj['EnrollmentRecords.isPaying'] ? "Paying" : "Indigent" : "",
  }))

  const ws = XLSX.utils.json_to_sheet(allMembersData);
  XLSX.utils.book_append_sheet(workbook, ws, template_name);
  const options = {
    title: "Save Enrollment Template",
    filters: [{ name: "All files", extensions: ["xlsx"] }],
  };
  dialog
    .showSaveDialog(options)
    .then((result) => {
      if (result.canceled)
        mainWindow.webContents.send(channels.EXPORT_ENROLLMENT);
      else if (result.filePath) {
        XLSX.writeFile(workbook, result.filePath);
        const response = {
          type: "Success",
          message: "Enrollment data exported successfully to '" + result.filePath + "'",
        };

        mainWindow.webContents.send(channels.SEND_NOTIFICATION, response);
        mainWindow.webContents.send(channels.EXPORT_ENROLLMENT);
      }
    })
    .catch((error) => console.log(error));
});

//*********** - REPORT METHODS - ****************//

ipcMain.on(channels.REPORT_ELIGIBLE_HOUSEHOLDS, (event, enrollmentPeriodId) => {
  mainWindow.webContents.send(channels.SYSTEM_PROGRESS, {
    open: true,
    progressTitle: "Loading Enrollment Report...",
    progressValue: 1
  })
  Report.getEligibleHouseholds(enrollmentPeriodId).then((result) => {
    mainWindow.webContents.send(channels.REPORT_ELIGIBLE_HOUSEHOLDS, result);
  });
})

ipcMain.on(channels.REPORT_TOTAL_HOUSEHOLD_ENROLLED, (event, enrollmentPeriodId) => {
  Report.getHouseholdsEnrolled(enrollmentPeriodId).then((result) => {
    mainWindow.webContents.send(channels.REPORT_TOTAL_HOUSEHOLD_ENROLLED, result);
  });
})

ipcMain.on(channels.REPORT_TOTAL_ENROLLMENT_BY_STATUS, (event, enrollmentPeriodId) => {
  Report.getTotalEnrollmentByStatus(enrollmentPeriodId).then((result) => {
    mainWindow.webContents.send(channels.REPORT_TOTAL_ENROLLMENT_BY_STATUS, result);
  });
})

ipcMain.on(channels.REPORT_MONTHLY_ENROLLMENT_STATS, (event, args) => {
  mainWindow.webContents.send(channels.SYSTEM_PROGRESS, {
    open: true,
    progressTitle: "Loading Enrollment Report...",
    progressValue: 0
  })
  Report.getMonthlyEnrollmentStats(args).then((result) => {
    mainWindow.webContents.send(channels.REPORT_MONTHLY_ENROLLMENT_STATS, result);
    mainWindow.webContents.send(channels.SYSTEM_PROGRESS, {
      open: false,
      progressTitle: "Loading Enrollment Report...",
      progressValue: 99
    })
  });
})

ipcMain.on(channels.REPORT_TOTAL_ENROLLMENT_STATS, (event, args) => {
  Report.getTotalEnrollmentStats(args).then((result) => {
    mainWindow.webContents.send(channels.REPORT_TOTAL_ENROLLMENT_STATS, result);
  });
})

ipcMain.on(channels.REPORT_TOTAL_ADDITIONAL_BENEFICIARIES, (event, enrollmentPeriodId) => {
  Report.getTotalAdditionalBeneficiariesByStatus(enrollmentPeriodId).then((result) => {
    mainWindow.webContents.send(channels.REPORT_TOTAL_ADDITIONAL_BENEFICIARIES, result);
  });
})

ipcMain.on(channels.REPORT_HOUSEHOLDS_BY_GENDER, (event, enrollmentPeriodId) => {
  Report.getHouseholdsByGender(enrollmentPeriodId).then((result) => {
    mainWindow.webContents.send(channels.REPORT_HOUSEHOLDS_BY_GENDER, result);
  });
})

ipcMain.on(channels.REPORT_TOTAL_BENEFICIARY_ENROLLED, (event, enrollmentPeriodId) => {
  Report.getBeneficiariesEnrolled(enrollmentPeriodId).then((result) => {
    mainWindow.webContents.send(channels.REPORT_TOTAL_BENEFICIARY_ENROLLED, result);
  });
})

ipcMain.on(channels.REPORT_ENROLLMENT_RATE, (event, enrollmentPeriodId) => {
  Report.getEnrollmentRate(enrollmentPeriodId).then((result) => {
    mainWindow.webContents.send(channels.REPORT_ENROLLMENT_RATE, result);
    mainWindow.webContents.send(channels.SYSTEM_PROGRESS, {
      open: true,
      progressTitle: "Loading Enrollment Report...",
      progressValue: 50
    })
  });
})

ipcMain.on(channels.REPORT_RENEWAL_RATE, (event, enrollmentPeriodId) => {
  Report.getRenewalRate(enrollmentPeriodId).then((result) => {
    mainWindow.webContents.send(channels.REPORT_RENEWAL_RATE, result);
    mainWindow.webContents.send(channels.SYSTEM_PROGRESS, {
      open: false,
      progressTitle: "Loading Enrollment Report...",
      progressValue: 99
    })
  });
})

ipcMain.on(channels.REPORT_SUBSIDIES, (event, enrollmentPeriodId) => {
  mainWindow.webContents.send(channels.SYSTEM_PROGRESS, {
    open: true,
    progressTitle: "Loading Contribution Report...",
    progressValue: 1
  })
  Report.getSubsidies(enrollmentPeriodId).then((result) => {
    mainWindow.webContents.send(channels.REPORT_SUBSIDIES, result);
  });
})

ipcMain.on(channels.REPORT_MONTHLY_CONTRIBUTION_STATS, (event, args) => {
  mainWindow.webContents.send(channels.SYSTEM_PROGRESS, {
    open: true,
    progressTitle: "Loading Contribution Report...",
    progressValue: 1
  })
  Report.getMonthlyContributionStats(args).then((result) => {
    mainWindow.webContents.send(channels.REPORT_MONTHLY_CONTRIBUTION_STATS, result);
    mainWindow.webContents.send(channels.SYSTEM_PROGRESS, {
      open: false,
      progressTitle: "Loading Contribution Report...",
      progressValue: 99
    })
  });
})

ipcMain.on(channels.REPORT_TOTAL_CONTRIBUTION_STATS, (event, enrollmentPeriodId) => {
  Report.getTotalContributionStats(enrollmentPeriodId).then((result) => {
    mainWindow.webContents.send(channels.REPORT_TOTAL_CONTRIBUTION_STATS, result);
  });
})

ipcMain.on(channels.REPORT_TOTAL_CONTRIBUTIONS, (event, enrollmentPeriodId) => {
  Report.getTotalContribution(enrollmentPeriodId).then((result) => {
    mainWindow.webContents.send(channels.REPORT_TOTAL_CONTRIBUTIONS, result);
  });
})

ipcMain.on(channels.REPORT_TOTAL_SUBSIDY, (event, enrollmentPeriodId) => {
  Report.getSubsidies(enrollmentPeriodId).then((result) => {
    mainWindow.webContents.send(channels.REPORT_TOTAL_SUBSIDY, result);
  });
})

ipcMain.on(channels.REPORT_TOTAL_CONTRIBUTIONS_COLLECTED, (event, enrollmentPeriodId) => {
  Report.getTotalContributionCollected(enrollmentPeriodId).then((result) => {
    mainWindow.webContents.send(channels.REPORT_TOTAL_CONTRIBUTIONS_COLLECTED, result);
    mainWindow.webContents.send(channels.SYSTEM_PROGRESS, {
      open: false,
      progressTitle: "Loading Contribution Report...",
      progressValue: 99
    })
  });
})

ipcMain.on(channels.EXPORT_ENROLLMENT_REPORT, async (event, args) => {
  const reportTemplateEnvPath = process.env.ELECTRON_START_URL ? '../public/reportTemplates/' : '../reportTemplates/'
  try {
    mainWindow.webContents.send(channels.SYSTEM_PROGRESS, {
      open: true,
      progressTitle: "Generating Enrollment Report...",
      progressValue: 0
    });
    readFile(path.join(__dirname, reportTemplateEnvPath, 'EnrollmentReportTemplate.xlsx'), async function (err, data) {
      // Create a template
      var template = new XlsxTemplate(data)

      // Replacements take place on first sheet
      var sheetNumber = 1;

      // ******** Report Query Methods ********
      const enrollmentReportData = await Report.generateEnrollmentReport(args)
      mainWindow.webContents.send(channels.SYSTEM_PROGRESS, {
        open: true,
        progressTitle: "Generating Enrollment Report...",
        progressValue: 75
      });

      // ******** Structuring Report ***********
      const newlyRegisteredMalePayingHouseholds = enrollmentReportData.getTotalNewlyEnrolledMembersByDateRange.filter((reportObj) => reportObj.isPaying && reportObj.gender === 'Male' && reportObj.isHouseholdHead)[0]?.count
      const newlyRegisteredFemalePayingHouseholds = enrollmentReportData.getTotalNewlyEnrolledMembersByDateRange.filter((reportObj) => reportObj.isPaying && reportObj.gender === 'Female' && reportObj.isHouseholdHead)[0]?.count
      const newlyRegisteredMaleIndigentHouseholds = enrollmentReportData.getTotalNewlyEnrolledMembersByDateRange.filter((reportObj) => !reportObj.isPaying && reportObj.gender === 'Male' && reportObj.isHouseholdHead)[0]?.count
      const newlyRegisteredFemaleIndigentHouseholds = enrollmentReportData.getTotalNewlyEnrolledMembersByDateRange.filter((reportObj) => !reportObj.isPaying && reportObj.gender === 'Female' && reportObj.isHouseholdHead)[0]?.count
      const totalNewlyRegisteredMalePayingHouseholds = enrollmentReportData.getTotalNewlyEnrolledMembers.filter((reportObj) => reportObj.isPaying && reportObj.gender === 'Male' && reportObj.isHouseholdHead)[0]?.count
      const totalNewlyRegisteredFemalePayingHouseholds = enrollmentReportData.getTotalNewlyEnrolledMembers.filter((reportObj) => reportObj.isPaying && reportObj.gender === 'Female' && reportObj.isHouseholdHead)[0]?.count
      const totalNewlyRegisteredMaleIndigentHouseholds = enrollmentReportData.getTotalNewlyEnrolledMembers.filter((reportObj) => !reportObj.isPaying && reportObj.gender === 'Male' && reportObj.isHouseholdHead)[0]?.count
      const totalNewlyRegisteredFemaleIndigentHouseholds = enrollmentReportData.getTotalNewlyEnrolledMembers.filter((reportObj) => !reportObj.isPaying && reportObj.gender === 'Female' && reportObj.isHouseholdHead)[0]?.count

      const renewedMalePayingHouseholds = enrollmentReportData.getTotalRenewingMembersByDateRange.filter((reportObj) => reportObj.isPaying && reportObj.gender === 'Male' && reportObj.isHouseholdHead)[0]?.count
      const renewedFemalePayingHouseholds = enrollmentReportData.getTotalRenewingMembersByDateRange.filter((reportObj) => reportObj.isPaying && reportObj.gender === 'Female' && reportObj.isHouseholdHead)[0]?.count
      const renewedMaleIndigentHouseholds = enrollmentReportData.getTotalRenewingMembersByDateRange.filter((reportObj) => !reportObj.isPaying && reportObj.gender === 'Male' && reportObj.isHouseholdHead)[0]?.count
      const renewedFemaleIndigentHouseholds = enrollmentReportData.getTotalRenewingMembersByDateRange.filter((reportObj) => !reportObj.isPaying && reportObj.gender === 'Female' && reportObj.isHouseholdHead)[0]?.count
      const totalRenewedMalePayingHouseholds = enrollmentReportData.getTotalRenewingMembers.filter((reportObj) => reportObj.isPaying && reportObj.gender === 'Male' && reportObj.isHouseholdHead)[0]?.count
      const totalRenewedFemalePayingHouseholds = enrollmentReportData.getTotalRenewingMembers.filter((reportObj) => reportObj.isPaying && reportObj.gender === 'Female' && reportObj.isHouseholdHead)[0]?.count
      const totalRenewedMaleIndigentHouseholds = enrollmentReportData.getTotalRenewingMembers.filter((reportObj) => !reportObj.isPaying && reportObj.gender === 'Male' && reportObj.isHouseholdHead)[0]?.count
      const totalRenewedFemaleIndigentHouseholds = enrollmentReportData.getTotalRenewingMembers.filter((reportObj) => !reportObj.isPaying && reportObj.gender === 'Female' && reportObj.isHouseholdHead)[0]?.count

      const newlyRegisteredMalePayingBeneficiaries = enrollmentReportData.getTotalNewlyEnrolledMembersByDateRange.filter((reportObj) => reportObj.isPaying && reportObj.gender === 'Male' && !reportObj.isHouseholdHead)[0]?.count
      const newlyRegisteredFemalePayingBeneficiaries = enrollmentReportData.getTotalNewlyEnrolledMembersByDateRange.filter((reportObj) => reportObj.isPaying && reportObj.gender === 'Female' && !reportObj.isHouseholdHead)[0]?.count
      const newlyRegisteredMaleIndigentBeneficiaries = enrollmentReportData.getTotalNewlyEnrolledMembersByDateRange.filter((reportObj) => !reportObj.isPaying && reportObj.gender === 'Male' && !reportObj.isHouseholdHead)[0]?.count
      const newlyRegisteredFemaleIndigentBeneficiaries = enrollmentReportData.getTotalNewlyEnrolledMembersByDateRange.filter((reportObj) => !reportObj.isPaying && reportObj.gender === 'Female' && !reportObj.isHouseholdHead)[0]?.count
      const totalNewlyRegisteredMalePayingBeneficiaries = enrollmentReportData.getTotalNewlyEnrolledMembers.filter((reportObj) => reportObj.isPaying && reportObj.gender === 'Male' && !reportObj.isHouseholdHead)[0]?.count
      const totalNewlyRegisteredFemalePayingBeneficiaries = enrollmentReportData.getTotalNewlyEnrolledMembers.filter((reportObj) => reportObj.isPaying && reportObj.gender === 'Female' && !reportObj.isHouseholdHead)[0]?.count
      const totalNewlyRegisteredMaleIndigentBeneficiaries = enrollmentReportData.getTotalNewlyEnrolledMembers.filter((reportObj) => !reportObj.isPaying && reportObj.gender === 'Male' && !reportObj.isHouseholdHead)[0]?.count
      const totalNewlyRegisteredFemaleIndigentBeneficiaries = enrollmentReportData.getTotalNewlyEnrolledMembers.filter((reportObj) => !reportObj.isPaying && reportObj.gender === 'Female' && !reportObj.isHouseholdHead)[0]?.count

      const renewedMalePayingBeneficiaries = enrollmentReportData.getTotalRenewingMembersByDateRange.filter((reportObj) => reportObj.isPaying && reportObj.gender === 'Male' && !reportObj.isHouseholdHead)[0]?.count
      const renewedFemalePayingBeneficiaries = enrollmentReportData.getTotalRenewingMembersByDateRange.filter((reportObj) => reportObj.isPaying && reportObj.gender === 'Female' && !reportObj.isHouseholdHead)[0]?.count
      const renewedMaleIndigentBeneficiaries = enrollmentReportData.getTotalRenewingMembersByDateRange.filter((reportObj) => !reportObj.isPaying && reportObj.gender === 'Male' && !reportObj.isHouseholdHead)[0]?.count
      const renewedFemaleIndigentBeneficiaries = enrollmentReportData.getTotalRenewingMembersByDateRange.filter((reportObj) => !reportObj.isPaying && reportObj.gender === 'Female' && !reportObj.isHouseholdHead)[0]?.count
      const totalRenewedMalePayingBeneficiaries = enrollmentReportData.getTotalRenewingMembers.filter((reportObj) => reportObj.isPaying && reportObj.gender === 'Male' && !reportObj.isHouseholdHead)[0]?.count
      const totalRenewedFemalePayingBeneficiaries = enrollmentReportData.getTotalRenewingMembers.filter((reportObj) => reportObj.isPaying && reportObj.gender === 'Female' && !reportObj.isHouseholdHead)[0]?.count
      const totalRenewedMaleIndigentBeneficiaries = enrollmentReportData.getTotalRenewingMembers.filter((reportObj) => !reportObj.isPaying && reportObj.gender === 'Male' && !reportObj.isHouseholdHead)[0]?.count
      const totalRenewedFemaleIndigentBeneficiaries = enrollmentReportData.getTotalRenewingMembers.filter((reportObj) => !reportObj.isPaying && reportObj.gender === 'Female' && !reportObj.isHouseholdHead)[0]?.count

      const totalMaleHouseholds = (totalNewlyRegisteredMalePayingHouseholds ? totalNewlyRegisteredMalePayingHouseholds : 0) +
        (totalNewlyRegisteredMaleIndigentHouseholds ? totalNewlyRegisteredMaleIndigentHouseholds : 0) +
        (totalRenewedMalePayingHouseholds ? totalRenewedMalePayingHouseholds : 0) +
        (totalRenewedMaleIndigentHouseholds ? totalRenewedMaleIndigentHouseholds : 0)
      const totalFemaleHouseholds = (totalNewlyRegisteredFemalePayingHouseholds ? totalNewlyRegisteredFemalePayingHouseholds : 0) +
        (totalNewlyRegisteredFemaleIndigentHouseholds ? totalNewlyRegisteredFemaleIndigentHouseholds : 0) +
        (totalRenewedFemalePayingHouseholds ? totalRenewedFemalePayingHouseholds : 0) +
        (totalRenewedFemaleIndigentHouseholds ? totalRenewedFemaleIndigentHouseholds : 0)

      const totalMaleBeneficiaries = (totalNewlyRegisteredMalePayingBeneficiaries ? totalNewlyRegisteredMalePayingBeneficiaries : 0) +
        (totalNewlyRegisteredMaleIndigentBeneficiaries ? totalNewlyRegisteredMaleIndigentBeneficiaries : 0) +
        (totalRenewedMalePayingBeneficiaries ? totalRenewedMalePayingBeneficiaries : 0) +
        (totalRenewedMaleIndigentBeneficiaries ? totalRenewedMaleIndigentBeneficiaries : 0)
      const totalFemaleBeneficiaries = (totalNewlyRegisteredFemalePayingBeneficiaries ? totalNewlyRegisteredFemalePayingBeneficiaries : 0) +
        (totalNewlyRegisteredFemaleIndigentBeneficiaries ? totalNewlyRegisteredFemaleIndigentBeneficiaries : 0) +
        (totalRenewedFemalePayingBeneficiaries ? totalRenewedFemalePayingBeneficiaries : 0) +
        (totalRenewedFemaleIndigentBeneficiaries ? totalRenewedFemaleIndigentBeneficiaries : 0)
      // ******** EOF Report Structuring ********

      // Set up some placeholder values matching the placeholders in the template
      const values = {
        schemeName: args.schemeName,
        eligibleHouseholds: enrollmentReportData.eligibleHouseholds,
        totalMembersLastYear: enrollmentReportData.previousYearEnrolledMembers,
        enrollmentYear: enrollmentReportData.enrollmentYear,
        reportingPeriod: `${args.dateFrom} <--> ${args.dateTo}`,

        newlyRegisteredMalePayingHouseholds,
        newlyRegisteredFemalePayingHouseholds,
        newlyRegisteredMaleIndigentHouseholds,
        newlyRegisteredFemaleIndigentHouseholds,
        totalNewlyRegisteredMalePayingHouseholds,
        totalNewlyRegisteredFemalePayingHouseholds,
        totalNewlyRegisteredMaleIndigentHouseholds,
        totalNewlyRegisteredFemaleIndigentHouseholds,
        renewedMalePayingHouseholds,
        renewedFemalePayingHouseholds,
        renewedMaleIndigentHouseholds,
        renewedFemaleIndigentHouseholds,
        totalRenewedMalePayingHouseholds,
        totalRenewedFemalePayingHouseholds,
        totalRenewedMaleIndigentHouseholds,
        totalRenewedFemaleIndigentHouseholds,

        newlyRegisteredMalePayingBeneficiaries,
        newlyRegisteredFemalePayingBeneficiaries,
        newlyRegisteredMaleIndigentBeneficiaries,
        newlyRegisteredFemaleIndigentBeneficiaries,
        totalNewlyRegisteredMalePayingBeneficiaries,
        totalNewlyRegisteredFemalePayingBeneficiaries,
        totalNewlyRegisteredMaleIndigentBeneficiaries,
        totalNewlyRegisteredFemaleIndigentBeneficiaries,
        renewedMalePayingBeneficiaries,
        renewedFemalePayingBeneficiaries,
        renewedMaleIndigentBeneficiaries,
        renewedFemaleIndigentBeneficiaries,
        totalRenewedMalePayingBeneficiaries,
        totalRenewedFemalePayingBeneficiaries,
        totalRenewedMaleIndigentBeneficiaries,
        totalRenewedFemaleIndigentBeneficiaries,
        totalMaleHouseholds,
        totalFemaleHouseholds,
        totalMaleBeneficiaries,
        totalFemaleBeneficiaries,

        totalNewlyRegisteredMalePaying: (newlyRegisteredMalePayingHouseholds ? newlyRegisteredMalePayingHouseholds : 0) +
          (newlyRegisteredMalePayingBeneficiaries ? newlyRegisteredMalePayingBeneficiaries : 0),
        totalNewlyRegisteredFemalePaying: (newlyRegisteredFemalePayingHouseholds ? newlyRegisteredFemalePayingHouseholds : 0) +
          (newlyRegisteredFemalePayingBeneficiaries ? newlyRegisteredFemalePayingBeneficiaries : 0),
        totalNewlyRegisteredMaleIndigent: (newlyRegisteredMaleIndigentHouseholds ? newlyRegisteredMaleIndigentHouseholds : 0) +
          (newlyRegisteredMaleIndigentBeneficiaries ? newlyRegisteredMaleIndigentBeneficiaries : 0),
        totalNewlyRegisteredFemaleIndigent: (newlyRegisteredFemaleIndigentHouseholds ? newlyRegisteredFemaleIndigentHouseholds : 0) +
          (newlyRegisteredFemaleIndigentBeneficiaries ? newlyRegisteredFemaleIndigentBeneficiaries : 0),
        totalNewlyRegisteredMalePayingMembers: (totalNewlyRegisteredMalePayingHouseholds ? totalNewlyRegisteredMalePayingHouseholds : 0) +
          (totalNewlyRegisteredMalePayingBeneficiaries ? totalNewlyRegisteredMalePayingBeneficiaries : 0),
        totalNewlyRegisteredFemalePayingMembers: (totalNewlyRegisteredFemalePayingHouseholds ? totalNewlyRegisteredFemalePayingHouseholds : 0) +
          (totalNewlyRegisteredFemalePayingBeneficiaries ? totalNewlyRegisteredFemalePayingBeneficiaries : 0),
        totalNewlyRegisteredMaleIndigentMembers: (totalNewlyRegisteredMaleIndigentHouseholds ? totalNewlyRegisteredMaleIndigentHouseholds : 0) +
          (totalNewlyRegisteredMaleIndigentBeneficiaries ? totalNewlyRegisteredMaleIndigentBeneficiaries : 0),
        totalNewlyRegisteredFemaleIndigentMembers: (totalNewlyRegisteredFemaleIndigentHouseholds ? totalNewlyRegisteredFemaleIndigentHouseholds : 0) +
          (totalNewlyRegisteredFemaleIndigentBeneficiaries ? totalNewlyRegisteredFemaleIndigentBeneficiaries : 0),
        totalRenewedMalePaying: (renewedMalePayingHouseholds ? renewedMalePayingHouseholds : 0) +
          (renewedMalePayingBeneficiaries ? renewedMalePayingBeneficiaries : 0),
        totalRenewedFemalePaying: (renewedFemalePayingHouseholds ? renewedFemalePayingHouseholds : 0) +
          (renewedFemalePayingBeneficiaries ? renewedFemalePayingBeneficiaries : 0),
        totalRenewedMaleIndigent: (renewedMaleIndigentHouseholds ? renewedMaleIndigentHouseholds : 0) +
          (renewedMaleIndigentBeneficiaries ? renewedMaleIndigentBeneficiaries : 0),
        totalRenewedFemaleIndigent: (renewedFemaleIndigentHouseholds ? renewedFemaleIndigentHouseholds : 0) +
          (renewedFemaleIndigentBeneficiaries ? renewedFemaleIndigentBeneficiaries : 0),
        totalRenewedMalePayingMembers: (totalRenewedMalePayingHouseholds ? totalRenewedMalePayingHouseholds : 0) +
          (totalRenewedMalePayingBeneficiaries ? totalRenewedMalePayingBeneficiaries : 0),
        totalRenewedFemalePayingMembers: (totalRenewedFemalePayingHouseholds ? totalRenewedFemalePayingHouseholds : 0) +
          (totalRenewedFemalePayingBeneficiaries ? totalRenewedFemalePayingBeneficiaries : 0),
        totalRenewedMaleIndigentMembers: (totalRenewedMaleIndigentHouseholds ? totalRenewedMaleIndigentHouseholds : 0) +
          (totalRenewedMaleIndigentBeneficiaries ? totalRenewedMaleIndigentBeneficiaries : 0),
        totalRenewedFemaleIndigentMembers: (totalRenewedFemaleIndigentHouseholds ? totalRenewedFemaleIndigentHouseholds : 0) +
          (totalRenewedFemaleIndigentBeneficiaries ? totalRenewedFemaleIndigentBeneficiaries : 0),
        totalMaleMembers: totalMaleHouseholds + totalMaleBeneficiaries,
        totalFemaleMembers: totalFemaleHouseholds + totalFemaleBeneficiaries,
        totalHouseholds: totalMaleHouseholds + totalFemaleHouseholds,
        totalBeneficiaries: totalMaleBeneficiaries + totalFemaleBeneficiaries,
        totalMembers: totalMaleHouseholds + totalFemaleHouseholds + totalMaleBeneficiaries + totalFemaleBeneficiaries,
        renewalRate: enrollmentReportData.previousYearEnrolledMembers > 0 ? `${(((totalMaleHouseholds + totalFemaleHouseholds) / enrollmentReportData.previousYearEnrolledMembers) * 100).toFixed(1)} %` : "-",
        enrollmentRate: enrollmentReportData.eligibleHouseholds > 0 ? `${(((totalMaleHouseholds + totalFemaleHouseholds) / enrollmentReportData.eligibleHouseholds) * 100).toFixed(1)} %` : "-",
        payingHouseholdsWithIdCard: enrollmentReportData.getTotalMembersWithIdCard.filter((reportObj) => reportObj.isPaying)[0]?.count,
        indigentHouseholdsWithIdCard: enrollmentReportData.getTotalMembersWithIdCard.filter((reportObj) => !reportObj.isPaying)[0]?.count,
      };

      // Perform substitution
      template.substitute(sheetNumber, values);

      // Get binary data
      const excelData = template.generate({ type: 'nodebuffer' });

      //Show progress completion
      mainWindow.webContents.send(channels.SYSTEM_PROGRESS, {
        open: true,
        progressTitle: "Generating Enrollment Report...",
        progressValue: 100
      });

      const options = {
        title: "Save Enrollment Report",
        filters: [{ name: "All files", extensions: ["xlsx"] }],
      };

      dialog.showSaveDialog(options).then((result) => {
        if (!result.canceled) {
          writeFile(result.filePath, excelData, 'binary', function (err) {
            const response = {
              type: "Success",
              message: "Enrollment Report exported successfully to '" + result.filePath + "'",
            };
            mainWindow.webContents.send(channels.SEND_NOTIFICATION, response);
          })
        }
        //Hide progress status
        mainWindow.webContents.send(channels.SYSTEM_PROGRESS, {
          open: false,
          progressTitle: "Generating Enrollment Report...",
          progressValue: 100
        });
      })
        .catch((error) => {
          //Hide progress status
          mainWindow.webContents.send(channels.SYSTEM_PROGRESS, {
            open: false,
            progressTitle: "Generating Enrollment Report...",
            progressValue: 100
          });
          console.log(error)
        });
    });
  } catch (error) {
    const response = {
      type: "Error",
      message: error
    };
    mainWindow.webContents.send(channels.SEND_NOTIFICATION, response);
    mainWindow.webContents.send(channels.SYSTEM_PROGRESS, {
      open: false,
      progressTitle: "Generating Enrollment Report...",
      progressValue: 0
    });
  }
});

//TODO - New Method EXPORT_CONTRIBUTION_REPORT


//*********** -  Import Enrollment Data  METHODS - ****************//

ipcMain.on(channels.DOWNLOAD_ENROLLMENT_TEMPLATE, (event) => {
  const workbook = XLSX.utils.book_new();
  const template_name = "CBHI Sheet";

  /* make worksheet */
  const template_data = [
    {
      "Full Name": "",
      "Date Of Birth(YYYY-MM-DD)": "",
      "Gender(Male/Female)": "",
      "Household CBHI Id": "",
      "Beneficiary CBHI Id": "",
      "Kebele/Gote": "",
      "Relationship": "",
      "Profession": "",
      "Enrollment Date (YYYY-MM-DD)": "",
      "is Household Head (1/0)": ""
    }
  ];
  const ws = XLSX.utils.json_to_sheet(template_data);
  XLSX.utils.book_append_sheet(workbook, ws, template_name);
  const options = {
    title: "Save Enrollment Template",
    filters: [{ name: "All files", extensions: ["xlsx"] }],
  };
  dialog
    .showSaveDialog(options)
    .then((result) => {
      if (result.filePath) {
        XLSX.writeFile(workbook, result.filePath);
        const response = {
          type: "Success",
          message: "Enrollment template saved successfully to '" + result.filePath + "'",
        };

        mainWindow.webContents.send(channels.SEND_NOTIFICATION, response);
      }
    })
    .catch((error) => console.log(error));
});

ipcMain.on(channels.IMPORT_ENROLLMENT, (event) => {
  const options = {
    title: "Upload Enrollment Excel Data",
    filters: [{ name: "All files", extensions: ["xlsx", "csv"] }],
    properties: ['openFile']
  };
  dialog.showOpenDialog(options).then((file) => {
    if (!file.canceled) {
      mainWindow.webContents.send(channels.SYSTEM_PROGRESS, {
        open: true,
        progressTitle: "Analyzing Enrollment Data...",
        progressValue: 1
      })
      const workbook = XLSX.readFile(file.filePaths[0]);
      const firstSheetName = workbook.SheetNames[0];
      const excelData = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], {
        header: ["fullName", "dateOfBirth", "gender", "cbhiId", "beneficiaryCBHIId", "administrativeDivision", "relationship", "profession", "enrolledDate", "isHouseholdHead"],
        range: 1,
      });
      setTimeout(() => {
        Member.excelDataParser(excelData).then((response) => {
          if (response.type === "Error") {
            mainWindow.webContents.send(channels.SYSTEM_PROGRESS, {
              open: false,
              progressTitle: "",
              progressValue: 0
            })
            mainWindow.webContents.send(channels.SEND_NOTIFICATION, response);
          }
          else {
            mainWindow.webContents.send(channels.SYSTEM_PROGRESS, {
              open: true,
              progressTitle: "Importing Enrollment Data...",
              progressValue: 50
            })
            Member.importEnrollmentData(response.data).then((response) => {
              if (response.type === "Success") {
                mainWindow.webContents.send(channels.SYSTEM_PROGRESS, {
                  open: false,
                  progressTitle: "Importing Enrollment Data Complete",
                  progressValue: 100
                })
                mainWindow.webContents.send(channels.SEND_NOTIFICATION, response);
              }
            }).catch((err) => {
              mainWindow.webContents.send(channels.SYSTEM_PROGRESS, {
                open: false,
                progressTitle: "Importing Enrollment Data Failed",
                progressValue: 75
              })
            });
          }
        })
      }, 3000);
    }
  })
    .catch((error) => console.log(error));
});

//*********** -  SYSTEM RESTORE & BACKUP METHODS - ****************//

ipcMain.on(channels.SYSTEM_BACKUP, (event) => {
  const currentDb = path.join(app.getPath("userData"), "cbhi_db.sqlite3");
  const options = {
    title: "Save Backup",
    filters: [{ name: "All files", extensions: ["sqlite3"] }],
  };
  dialog
    .showSaveDialog(options)
    .then((result) => {
      if (result.filePath)
        copyFile(currentDb, result.filePath, (err) => {
          if (err) {
            console.log(err);
          }
          const response = {
            type: "Success",
            message: "System backup saved successfully to '" + result.filePath + "'",
          };
          mainWindow.webContents.send(channels.SEND_NOTIFICATION, response);
        });
    })
    .catch((error) => console.log(error));
});

ipcMain.on(channels.SYSTEM_RESTORE, (event) => {
  const currentDb = path.join(app.getPath("userData"), "cbhi_db.sqlite3");
  const backUp = path.join(app.getPath("userData"), "cbhi_db_" + new Date().getTime() + ".sqlite3");
  const options = {
    title: "Upload latest backup",
    filters: [{ name: "All files", extensions: ["sqlite3"] }],
    properties: ['openFile']
  };
  dialog
    .showOpenDialog(options)
    .then((file) => {
      if (!file.canceled) {
        mainWindow.webContents.send(channels.SYSTEM_PROGRESS, {
          open: true,
          progressTitle: "System Restore in Progress...",
          progressValue: 0
        });
        //Backup previous database to avoid overwrite
        copyFile(currentDb, backUp, (err) => {
          if (err) console.log(err);
          copyFile(file.filePaths[0], currentDb, (err) => {
            if (err) console.log(err);
            const response = {
              type: "Success",
              message: "System restored successfully. Application will restart in 5 seconds to apply changes.",
            };
            mainWindow.webContents.send(channels.SEND_NOTIFICATION, response);
            app.relaunch();
            setTimeout(() => {
              mainWindow.webContents.send(channels.SYSTEM_PROGRESS, {
                open: false,
                progressTitle: "System Restore Complete!",
                progressValue: 100
              });
              app.exit();
            }, 5000);
          });
        })
      }
    })
    .catch((error) => console.log(error));
});

ipcMain.on(channels.SYSTEM_RESET, (event) => {
  const currentDb = path.join(app.getPath("userData"), "cbhi_db.sqlite3");
  const options = {
    title: "Save Backup",
    filters: [{ name: "All files", extensions: ["sqlite3"] }],
  };
  dialog.showSaveDialog(options).then((result) => {
    let timer = 5;
    if (result.filePath) {
      mainWindow.webContents.send(channels.SYSTEM_PROGRESS, {
        open: true,
        progressTitle: "System Reset in Progress...",
        progressValue: 0
      });
      copyFile(currentDb, result.filePath, (err) => {
        if (err) console.log(err)
        else {
          db.sequelize.close().then(() => {
            removeFile(currentDb, (err) => {
              if (err) {
                mainWindow.webContents.send(channels.SYSTEM_PROGRESS, {
                  open: false,
                  progressTitle: "System Reset in Progress...",
                  progressValue: 0
                });
                const response = {
                  type: "Error",
                  message: "System reset failed! Please try again or contact System Administrators",
                };
                mainWindow.webContents.send(channels.SEND_NOTIFICATION, response);
              } else {
                const response = {
                  type: "Success",
                  message: "All data have been cleaned from the system successfully. A backup of previous database is saved to '" + result.filePath + "'",
                };
                mainWindow.webContents.send(channels.SEND_NOTIFICATION, response);
                app.relaunch();
                setInterval(() => {
                  if (timer >= 0) {
                    mainWindow.webContents.send(channels.SYSTEM_PROGRESS, {
                      open: true,
                      progressTitle: "System Restarting in " + timer + " Seconds.",
                      progressValue: 99
                    });
                    timer -= 1;
                  } else app.exit();
                }, 1000)
              }
            })
          })
        }
      });
    }
  })
    .catch((error) => console.log(error));
});

//*********** -  DEVELOPER TOOLS - ****************//

ipcMain.on(channels.DEV_TOOLS, function () {
  mainWindow.webContents.openDevTools();
});
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const url = require("url");
const { channels } = require("../src/shared/constants");
const initDatabase = require("./db/initDatabase");
const { autoUpdater } = require("electron-updater");
const Profile = require("./businessLogic/Profile");
const AdministrativeDivision = require("./businessLogic/AdministrativeDivision");
const EnrollmentPeriod = require("./businessLogic/EnrollmentPeriod");
const Member = require("./businessLogic/Member");
const EnrollmentRecord = require("./businessLogic/EnrollmentRecord");
const Report = require("./businessLogic/Report");
const writeFile = require("fs").writeFile;
const { Parser } = require("json2csv");

let mainWindow;

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

app.on("window-all-closed", function () {
  app.quit();
});

app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});

//*********** - Export To CSV Functions - ***************/

const exportEnrollmentData = async () => {
  const fields = [
    { label: "Full Name", value: "Members.fullName" },
    { label: "Date of Birth", value: "Members.dateOfBirth" },
    { label: "Gender", value: "Members.gender" },
    { label: "CBHI ID", value: "Members.cbhiId" },
    {
      label: "Kebele/Gote",
      value: (rowData) =>
        rowData["AdministrativeDivision.name"] +
        " (" +
        rowData["AdministrativeDivision.level"] +
        ")",
    },
    { label: "Relationship", value: "Members.relationship" },
    { label: "Profession", value: "Members.profession" },
    { label: "Enrollment Date", value: "Members.enrolledDate" },
    {
      label: "Membership Status",
      value: (rowData) =>
        rowData["EnrollmentRecords.id"] ? "Active" : "Expired",
    },
  ];

  try {
    const allMembersData = await Member.getAllMembers();
    const json2csvParser = new Parser({ fields });
    const csvData = json2csvParser.parse(allMembersData);
    return csvData;
  } catch (err) {
    console.error(err);
  }
};

//*********** - APPLICATION METHODS - ********************//
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

//*********** - MEMBER RENEWAL METHODS - ****************//

ipcMain.on(channels.LOAD_MEMBER_RENEWAL, (event, householdId) => {
  EnrollmentRecord.loadNewEnrollmentRecord(householdId).then((result) => {
    mainWindow.webContents.send(channels.LOAD_MEMBER_RENEWAL, result);
  });
});

ipcMain.on(channels.CREATE_MEMBER_RENEWAL, (event, enrollmentRecordObj) => {
  EnrollmentRecord.addEnrollmentRecord(enrollmentRecordObj)
    .then((response) => {
      mainWindow.webContents.send(channels.SEND_NOTIFICATION, response);
      if (response.type === "Success")
        mainWindow.webContents.send(channels.MEMBER_RENEWAL_SUCCESS);
    })
    .catch((err) => console.log(err));
});

//*********** - EXPORT ENROLLMENT DATA METHODS - ****************//

ipcMain.on(channels.EXPORT_ENROLLMENT, (event, columns) => {
  exportEnrollmentData(columns)
    .then((dataset) => {
      const options = {
        title: "Save Enrollment Data",
        filters: [{ name: "All files", extensions: ["csv"] }],
      };
      dialog
        .showSaveDialog(options)
        .then((result) => {
          if (result.filePath)
            writeFile(result.filePath, dataset, (err) => {
              if (err) {
                console.log(err);
              }
              const response = {
                type: "Success",
                message: "Enrollment data exported successfully",
              };
              mainWindow.webContents.send(channels.SEND_NOTIFICATION, response);
              mainWindow.webContents.send(channels.EXPORT_ENROLLMENT);
            });
        })
        .catch((error) => console.log(error));
    })
    .catch((error) => {
      console.log(error);
    });
});

//*********** - REPORT METHODS - ****************//

ipcMain.on(channels.REPORT_ELIGIBLE_HOUSEHOLDS, (event, enrollmentPeriodId) => {
  Report.getEligibleHouseholds(enrollmentPeriodId).then((result) => {
    mainWindow.webContents.send(channels.REPORT_ELIGIBLE_HOUSEHOLDS, result);
  });
})

ipcMain.on(channels.REPORT_MONTHLY_ENROLLMENT_STAT, (event, args) => {
  Report.getMonthlyEnrollmentStat(args).then((result) => {
    mainWindow.webContents.send(channels.REPORT_MONTHLY_ENROLLMENT_STAT, result);
  });
})

ipcMain.on(channels.REPORT_TOTAL_ACTIVE_MEMBERS, (event, enrollmentPeriodId) => {
  Report.getTotalActiveMembers(enrollmentPeriodId).then((result) => {
    mainWindow.webContents.send(channels.REPORT_TOTAL_ACTIVE_MEMBERS, result);
  });
})

ipcMain.on(channels.REPORT_TOTAL_CONTRIBUTION, (event, enrollmentPeriodId) => {
  Report.getTotalContribution(enrollmentPeriodId).then((result) => {
    mainWindow.webContents.send(channels.REPORT_TOTAL_CONTRIBUTION, result);
  });
})

ipcMain.on(channels.REPORT_TOTAL_REGISTRATION_FEE, (event, enrollmentPeriodId) => {
  Report.getTotalRegistrationFee(enrollmentPeriodId).then((result) => {
    mainWindow.webContents.send(channels.REPORT_TOTAL_REGISTRATION_FEE, result);
  });
})


//*********** -  DEVELOPER TOOLS - ****************//

ipcMain.on(channels.DEV_TOOLS, function () {
  mainWindow.webContents.openDevTools();
});

const TIMEZONE =
  "Europe/Brussels";

/**
 * Laat leeg om je standaardagenda te gebruiken.
 * Vul voor een andere agenda de agenda-ID in.
 */
const CALENDAR_ID =
  "";

const APPOINTMENT_DURATION_MINUTES =
  60;

const BUFFER_MINUTES =
  30;

const AVAILABILITY_TITLE =
  "BESCHIKBAAR - begeleiding";

const MEET_POLL_ATTEMPTS =
  12;

const MEET_POLL_WAIT_MS =
  750;

/* =========================================================
   Basisfuncties
   ========================================================= */

function clean(value) {
  return String(
    value === null ||
    value === undefined
      ? ""
      : value
  ).trim();
}

function normalizeText(
  value
) {
  return clean(
    value
  ).toLowerCase();
}

function normalizeTitle(
  value
) {
  return normalizeText(
    value
  );
}

function isDigitalAppointmentType(
  value
) {
  const normalized =
    normalizeText(
      value
    );

  return (
    normalized.indexOf(
      "digital"
    ) !== -1 ||
    normalized.indexOf(
      "digitaal"
    ) !== -1 ||
    normalized.indexOf(
      "online"
    ) !== -1 ||
    normalized.indexOf(
      "video"
    ) !== -1 ||
    normalized.indexOf(
      "meet"
    ) !== -1 ||
    normalized.indexOf(
      "afstand"
    ) !== -1
  );
}

function json(data) {
  return ContentService
    .createTextOutput(
      JSON.stringify(
        data
      )
    )
    .setMimeType(
      ContentService
        .MimeType
        .JSON
    );
}

function getCalendar() {
  if (
    CALENDAR_ID
  ) {
    const calendar =
      CalendarApp
        .getCalendarById(
          CALENDAR_ID
        );

    if (!calendar) {
      throw new Error(
        "De ingestelde Google Agenda werd niet gevonden."
      );
    }

    return calendar;
  }

  return CalendarApp
    .getDefaultCalendar();
}

function getCalendarId() {
  if (
    CALENDAR_ID
  ) {
    return CALENDAR_ID;
  }

  return CalendarApp
    .getDefaultCalendar()
    .getId();
}

/* =========================================================
   Beveiliging
   ========================================================= */

function getBookingSecret() {
  return clean(
    PropertiesService
      .getScriptProperties()
      .getProperty(
        "BOOKING_SECRET"
      )
  );
}

function validateSecret(
  data
) {
  const configuredSecret =
    getBookingSecret();

  if (
    !configuredSecret
  ) {
    return;
  }

  if (
    clean(
      data.secret
    ) !==
    configuredSecret
  ) {
    throw new Error(
      "Ongeldige boekingssleutel."
    );
  }
}

/* =========================================================
   GET
   ========================================================= */

function doGet(e) {
  try {
    const date =
      clean(
        e &&
        e.parameter &&
        e.parameter.date
      );

    const duration =
      Number(
        (
          e &&
          e.parameter &&
          e.parameter.duration
        ) ||
        APPOINTMENT_DURATION_MINUTES
      );

    if (!date) {
      return json({
        success:
          false,
        slots:
          [],
        error:
          "Datum ontbreekt.",
      });
    }

    if (
      !Number.isFinite(
        duration
      ) ||
      duration <= 0
    ) {
      return json({
        success:
          false,
        slots:
          [],
        error:
          "Ongeldige duur.",
      });
    }

    const slots =
      getSlotsFromCalendar(
        date,
        duration
      );

    return json({
      success:
        true,
      slots:
        slots,
      date:
        date,
      duration:
        duration,
      buffer:
        BUFFER_MINUTES,
    });
  } catch (error) {
    console.error(
      error
    );

    return json({
      success:
        false,
      slots:
        [],
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
}

/* =========================================================
   POST-router
   ========================================================= */

function doPost(e) {
  try {
    if (
      !e ||
      !e.postData ||
      !e.postData.contents
    ) {
      return json({
        success:
          false,
        error:
          "Er werden geen gegevens ontvangen.",
      });
    }

    const data =
      JSON.parse(
        e.postData.contents
      );

    validateSecret(
      data
    );

    const action =
      clean(
        data.action
      ) ||
      "createBooking";

    if (
      action ===
      "cancelBooking"
    ) {
      return cancelGoogleBooking(
        data
      );
    }

    if (
      action ===
      "ensureMeetLink"
    ) {
      const result =
        ensureGoogleMeetLink(
          data
        );

      return json({
        success:
          true,
        action:
          action,
        eventId:
          result.eventId,
        htmlLink:
          result.htmlLink,
        meetLink:
          result.meetLink,
        conferenceStatus:
          result.conferenceStatus,
        existing:
          result.existing,
        created:
          result.created,
      });
    }

    if (
      action !==
        "createBooking" &&
      action !==
        "backfillBooking"
    ) {
      return json({
        success:
          false,
        error:
          "Onbekende actie: " +
          action,
      });
    }

    validateBookingData(
      data
    );

    /*
     * Alleen bij volledig nieuwe boeking
     * controleren of het moment nog vrij is.
     */
    if (
      action ===
      "createBooking"
    ) {
      const availableSlots =
        getSlotsFromCalendar(
          data.date,
          APPOINTMENT_DURATION_MINUTES
        );

      if (
        !availableSlots.includes(
          clean(
            data.time
          )
        )
      ) {
        return json({
          success:
            false,
          error:
            "Dit tijdstip is intussen niet meer beschikbaar.",
        });
      }
    }

    const booking =
      createGoogleBooking(
        data
      );

    return json({
      success:
        true,
      action:
        action,
      eventId:
        booking.eventId,
      htmlLink:
        booking.htmlLink,
      meetLink:
        booking.meetLink,
      conferenceStatus:
        booking.conferenceStatus,
      start:
        booking.start,
      end:
        booking.end,
    });
  } catch (error) {
    console.error(
      error
    );

    return json({
      success:
        false,
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
}

/* =========================================================
   Beschikbaarheid
   ========================================================= */

function getDayRange(
  dateString
) {
  const selectedDate =
    Utilities.parseDate(
      dateString,
      TIMEZONE,
      "yyyy-MM-dd"
    );

  const dayStart =
    new Date(
      selectedDate.getTime()
    );

  dayStart.setHours(
    0,
    0,
    0,
    0
  );

  const dayEnd =
    new Date(
      selectedDate.getTime()
    );

  dayEnd.setHours(
    23,
    59,
    59,
    999
  );

  return {
    dayStart:
      dayStart,
    dayEnd:
      dayEnd,
  };
}

function isAvailabilityEvent(
  event
) {
  return (
    normalizeTitle(
      event.getTitle()
    ) ===
    normalizeTitle(
      AVAILABILITY_TITLE
    )
  );
}

function getSlotsFromCalendar(
  dateString,
  durationMinutes
) {
  const calendar =
    getCalendar();

  const range =
    getDayRange(
      dateString
    );

  const events =
    calendar.getEvents(
      range.dayStart,
      range.dayEnd
    );

  const availabilityBlocks =
    events.filter(
      function (event) {
        return isAvailabilityEvent(
          event
        );
      }
    );

  const busyEvents =
    events.filter(
      function (event) {
        return !isAvailabilityEvent(
          event
        );
      }
    );

  const durationMs =
    durationMinutes *
    60 *
    1000;

  const bufferMs =
    BUFFER_MINUTES *
    60 *
    1000;

  const now =
    new Date();

  const slots =
    [];

  availabilityBlocks.forEach(
    function (block) {
      let current =
        new Date(
          block.getStartTime()
        );

      const blockEnd =
        new Date(
          block.getEndTime()
        );

      while (
        current.getTime() +
          durationMs <=
        blockEnd.getTime()
      ) {
        const slotStart =
          new Date(
            current.getTime()
          );

        const slotEnd =
          new Date(
            slotStart.getTime() +
              durationMs
          );

        const reservedUntil =
          new Date(
            slotEnd.getTime() +
              bufferMs
          );

        const isInPast =
          slotStart.getTime() <=
          now.getTime();

        const overlapsBusyEvent =
          busyEvents.some(
            function (event) {
              const eventStart =
                event.getStartTime();

              const eventEnd =
                event.getEndTime();

              return (
                slotStart <
                  eventEnd &&
                reservedUntil >
                  eventStart
              );
            }
          );

        if (
          !isInPast &&
          !overlapsBusyEvent
        ) {
          slots.push(
            Utilities
              .formatDate(
                slotStart,
                TIMEZONE,
                "HH:mm"
              )
          );
        }

        current =
          new Date(
            slotStart.getTime() +
              durationMs +
              bufferMs
          );
      }
    }
  );

  return Array.from(
    new Set(
      slots
    )
  ).sort();
}

/* =========================================================
   Validatie
   ========================================================= */

function validateBookingData(
  data
) {
  if (
    !clean(
      data.date
    )
  ) {
    throw new Error(
      "De datum ontbreekt."
    );
  }

  if (
    !clean(
      data.time
    )
  ) {
    throw new Error(
      "Het tijdstip ontbreekt."
    );
  }

  if (
    !clean(
      data.customerName
    )
  ) {
    throw new Error(
      "De naam ontbreekt."
    );
  }

  if (
    !clean(
      data.email
    )
  ) {
    throw new Error(
      "Het e-mailadres ontbreekt."
    );
  }

  if (
    !clean(
      data.appointmentType
    )
  ) {
    throw new Error(
      "Het type afspraak ontbreekt."
    );
  }
}

/* =========================================================
   Nieuwe afspraak maken
   ========================================================= */

function createGoogleBooking(
  data
) {
  const calendarId =
    getCalendarId();

  const start =
    makeDateTime(
      data.date,
      data.time
    );

  const end =
    new Date(
      start.getTime() +
        APPOINTMENT_DURATION_MINUTES *
          60 *
          1000
    );

  const isDigital =
    isDigitalAppointmentType(
      data.appointmentType
    );

  const summary =
    isDigital
      ? "Digitale studiebegeleiding - " +
        clean(
          data.customerName
        )
      : "Studiebegeleiding aan huis - " +
        clean(
          data.customerName
        );

  const description =
    [
      clean(
        data.bookingId
      )
        ? "Studio SaGo boekings-ID: " +
          clean(
            data.bookingId
          )
        : "",

      clean(
        data.notes
      )
        ? "Onderwerp: " +
          clean(
            data.notes
          )
        : "",

      "Type: " +
        (
          isDigital
            ? "Digitaal"
            : "Fysiek aan huis"
        ),

      !isDigital &&
      clean(
        data.customerAddress
      )
        ? "Adres: " +
          clean(
            data.customerAddress
          )
        : "",

      "",

      "Annulatiebeleid: een beurt wordt enkel teruggezet bij annulatie minstens 72 uur vooraf.",
    ]
      .filter(Boolean)
      .join("\n");

  const event = {
    summary:
      summary,

    description:
      description,

    start: {
      dateTime:
        start.toISOString(),
      timeZone:
        TIMEZONE,
    },

    end: {
      dateTime:
        end.toISOString(),
      timeZone:
        TIMEZONE,
    },

    attendees: [
      {
        email:
          clean(
            data.email
          ),
      },
    ],

    reminders: {
      useDefault:
        false,

      overrides: [
        {
          method:
            "popup",
          minutes:
            30,
        },
        {
          method:
            "email",
          minutes:
            60,
        },
      ],
    },
  };

  if (
    !isDigital
  ) {
    event.location =
      clean(
        data.customerAddress
      );
  }

  if (
    isDigital
  ) {
    event.conferenceData = {
      createRequest: {
        requestId:
          Utilities
            .getUuid(),

        conferenceSolutionKey: {
          type:
            "hangoutsMeet",
        },
      },
    };
  }

  const createdEvent =
    Calendar.Events.insert(
      event,
      calendarId,
      {
        conferenceDataVersion:
          isDigital
            ? 1
            : 0,

        sendUpdates:
          "all",
      }
    );

  let finalEvent =
    createdEvent;

  if (
    isDigital &&
    createdEvent.id
  ) {
    finalEvent =
      waitForGoogleMeet(
        calendarId,
        createdEvent.id,
        createdEvent
      );
  }

  const meetLink =
    isDigital
      ? getMeetLink(
          finalEvent
        )
      : "";

  if (
    isDigital &&
    !meetLink
  ) {
    throw new Error(
      "De Google Agenda-afspraak werd aangemaakt, maar Google gaf nog geen Meet-link terug."
    );
  }

  return {
    eventId:
      clean(
        finalEvent.id ||
        createdEvent.id
      ),

    htmlLink:
      clean(
        finalEvent.htmlLink ||
        createdEvent.htmlLink
      ),

    meetLink:
      meetLink,

    conferenceStatus:
      getConferenceStatus(
        finalEvent
      ),

    start:
      start.toISOString(),

    end:
      end.toISOString(),
  };
}

/* =========================================================
   Meet-link aan bestaand event toevoegen
   ========================================================= */

function ensureGoogleMeetLink(
  data
) {
  const calendarId =
    getCalendarId();

  const suppliedEventId =
    clean(
      data.eventId ||
      data.googleEventId
    );

  const bookingId =
    clean(
      data.bookingId
    );

  let eventId =
    suppliedEventId;

  if (
    eventId &&
    !googleEventExists(
      calendarId,
      eventId
    )
  ) {
    eventId =
      "";
  }

  if (
    !eventId &&
    bookingId
  ) {
    eventId =
      findEventIdByBookingId(
        bookingId
      );
  }

  if (!eventId) {
    throw new Error(
      "Het bestaande Google Agenda-evenement werd niet gevonden."
    );
  }

  let existingEvent =
    Calendar.Events.get(
      calendarId,
      eventId
    );

  const existingMeetLink =
    getMeetLink(
      existingEvent
    );

  if (
    existingMeetLink
  ) {
    return {
      eventId:
        eventId,

      htmlLink:
        clean(
          existingEvent.htmlLink
        ),

      meetLink:
        existingMeetLink,

      conferenceStatus:
        getConferenceStatus(
          existingEvent
        ),

      existing:
        true,

      created:
        false,
    };
  }

  const patchResource = {
    conferenceData: {
      createRequest: {
        requestId:
          Utilities
            .getUuid(),

        conferenceSolutionKey: {
          type:
            "hangoutsMeet",
        },
      },
    },
  };

  const patchedEvent =
    Calendar.Events.patch(
      patchResource,
      calendarId,
      eventId,
      {
        conferenceDataVersion:
          1,

        sendUpdates:
          "all",
      }
    );

  existingEvent =
    waitForGoogleMeet(
      calendarId,
      eventId,
      patchedEvent
    );

  const meetLink =
    getMeetLink(
      existingEvent
    );

  if (!meetLink) {
    throw new Error(
      "De Google Meet-link kon niet aan het bestaande evenement worden toegevoegd."
    );
  }

  return {
    eventId:
      eventId,

    htmlLink:
      clean(
        existingEvent.htmlLink
      ),

    meetLink:
      meetLink,

    conferenceStatus:
      getConferenceStatus(
        existingEvent
      ),

    existing:
      false,

    created:
      true,
  };
}

/* =========================================================
   Wachten op Meet-link
   ========================================================= */

function waitForGoogleMeet(
  calendarId,
  eventId,
  initialEvent
) {
  let currentEvent =
    initialEvent;

  for (
    let attempt = 0;
    attempt <
      MEET_POLL_ATTEMPTS;
    attempt += 1
  ) {
    const meetLink =
      getMeetLink(
        currentEvent
      );

    const status =
      getConferenceStatus(
        currentEvent
      );

    if (
      meetLink
    ) {
      return currentEvent;
    }

    if (
      status ===
      "failure"
    ) {
      throw new Error(
        "Google Meet kon niet worden aangemaakt."
      );
    }

    Utilities.sleep(
      MEET_POLL_WAIT_MS
    );

    currentEvent =
      Calendar.Events.get(
        calendarId,
        eventId
      );
  }

  currentEvent =
    Calendar.Events.get(
      calendarId,
      eventId
    );

  if (
    !getMeetLink(
      currentEvent
    )
  ) {
    throw new Error(
      "Google Agenda werd bijgewerkt, maar de Meet-link was nog niet beschikbaar."
    );
  }

  return currentEvent;
}

function getConferenceStatus(
  event
) {
  return clean(
    event &&
    event.conferenceData &&
    event.conferenceData
      .createRequest &&
    event.conferenceData
      .createRequest
      .status &&
    event.conferenceData
      .createRequest
      .status
      .statusCode
  );
}

function getMeetLink(
  event
) {
  if (!event) {
    return "";
  }

  const directLink =
    clean(
      event.hangoutLink
    );

  if (
    directLink
  ) {
    return directLink;
  }

  const entryPoints =
    event.conferenceData &&
    Array.isArray(
      event.conferenceData
        .entryPoints
    )
      ? event.conferenceData
          .entryPoints
      : [];

  const videoEntry =
    entryPoints.find(
      function (entry) {
        return (
          entry &&
          entry.entryPointType ===
            "video" &&
          clean(
            entry.uri
          )
        );
      }
    );

  return videoEntry
    ? clean(
        videoEntry.uri
      )
    : "";
}

/* =========================================================
   Afspraak verwijderen
   ========================================================= */

function cancelGoogleBooking(
  data
) {
  const suppliedEventId =
    clean(
      data.eventId ||
      data.googleEventId
    );

  const bookingId =
    clean(
      data.bookingId
    );

  if (
    !suppliedEventId &&
    !bookingId
  ) {
    return json({
      success:
        false,
      error:
        "Google event-ID en boekings-ID ontbreken.",
    });
  }

  const calendarId =
    getCalendarId();

  let resolvedEventId =
    suppliedEventId;

  if (
    resolvedEventId &&
    !googleEventExists(
      calendarId,
      resolvedEventId
    )
  ) {
    resolvedEventId =
      "";
  }

  if (
    !resolvedEventId &&
    bookingId
  ) {
    resolvedEventId =
      findEventIdByBookingId(
        bookingId
      );
  }

  if (
    !resolvedEventId
  ) {
    return json({
      success:
        true,
      deleted:
        false,
      alreadyDeleted:
        true,
      skipped:
        true,
      bookingId:
        bookingId,
      message:
        "Het Google Agenda-evenement bestond niet meer.",
    });
  }

  try {
    Calendar.Events.remove(
      calendarId,
      resolvedEventId,
      {
        sendUpdates:
          "all",
      }
    );

    return json({
      success:
        true,
      deleted:
        true,
      eventId:
        resolvedEventId,
      bookingId:
        bookingId,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    if (
      message.includes(
        "404"
      ) ||
      message
        .toLowerCase()
        .includes(
          "not found"
        )
    ) {
      return json({
        success:
          true,
        deleted:
          false,
        alreadyDeleted:
          true,
        skipped:
          true,
        eventId:
          resolvedEventId,
        bookingId:
          bookingId,
        message:
          "Het Google Agenda-evenement was al verwijderd.",
      });
    }

    throw new Error(
      "Google Agenda-evenement kon niet verwijderd worden: " +
      message
    );
  }
}

/* =========================================================
   Evenement terugvinden
   ========================================================= */

function googleEventExists(
  calendarId,
  eventId
) {
  try {
    const event =
      Calendar.Events.get(
        calendarId,
        eventId
      );

    return Boolean(
      event &&
      event.id
    );
  } catch (error) {
    return false;
  }
}

function findEventIdByBookingId(
  bookingId
) {
  const marker =
    "Studio SaGo boekings-ID: " +
    bookingId;

  const now =
    new Date();

  const start =
    new Date(
      now.getTime()
    );

  start.setFullYear(
    start.getFullYear() -
      1
  );

  const end =
    new Date(
      now.getTime()
    );

  end.setFullYear(
    end.getFullYear() +
      3
  );

  const result =
    Calendar.Events.list(
      getCalendarId(),
      {
        timeMin:
          start.toISOString(),

        timeMax:
          end.toISOString(),

        singleEvents:
          true,

        showDeleted:
          false,

        maxResults:
          2500,
      }
    );

  const items =
    result.items ||
    [];

  const match =
    items.find(
      function (item) {
        return clean(
          item.description
        ).indexOf(
          marker
        ) !== -1;
      }
    );

  return match &&
    match.id
    ? match.id
    : "";
}

/* =========================================================
   Datumhelpers
   ========================================================= */

function makeDateTime(
  dateString,
  timeString
) {
  return Utilities
    .parseDate(
      clean(
        dateString
      ) +
        " " +
        clean(
          timeString
        ),
      TIMEZONE,
      "yyyy-MM-dd HH:mm"
    );
}
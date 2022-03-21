var externalSourceMatrice = [
    {
      priority: 3,
      platform: "windows",
      browser: "chrome",
      sourcePriority: {
        DASH: 1,
        HLS: 1,
        VHLS: 0
      }
    },
    {
      priority: 1,
      platform: "ios",
      browser: "safari",
      sourcePriority: {
        DASH: 0,
        HLS: 1,
        VHLS: 1
      }
    },
    {
      priority: 2,
      platform: "any",
      browser: "firefox",
      sourcePriority: {
        DASH: 1,
        HLS: 0,
        VHLS: 0
      }
    },
    {
      priority: 5,
      platform: "any",
      browser: "any",
      sourcePriority: {
        DASH: 1,
        HLS: 1,
        VHLS: 0
      }
    },
    {
      priority: 4,
      platform: "any",
      browser: "opera",
      sourcePriority: {
        DASH: 0,
        HLS: 1,
        VHLS: 0
      }
    }
  ];


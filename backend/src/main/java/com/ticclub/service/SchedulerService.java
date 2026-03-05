package com.ticclub.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class SchedulerService {

    @Scheduled(cron = "0 0 0 * * ?") // Every day at midnight
    public void performDailyCleanup() {
        // cleanup tasks
    }
}

package com.ticclub.core.dto;

import java.util.List;

public record TeamRequest(String name, String description, List<Long> memberIds) {}

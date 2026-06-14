const USER_ROLES = Object.freeze({
  PASSENGER: "passenger",
  DRIVER: "driver",
  TRAFFIC_AUTHORITY: "traffic_authority",
  GARAGE_MANAGER: "garage_manager",
  FUEL_STATION_MANAGER: "fuel_station_manager",
  SYSTEM_ADMIN: "system_admin"
});

const ASSIGNABLE_ROLES = Object.freeze([
  USER_ROLES.DRIVER,
  USER_ROLES.TRAFFIC_AUTHORITY,
  USER_ROLES.GARAGE_MANAGER,
  USER_ROLES.FUEL_STATION_MANAGER,
  USER_ROLES.SYSTEM_ADMIN
]);

module.exports = {
  USER_ROLES,
  ASSIGNABLE_ROLES
};

"use strict";

const chai = require("chai");
const Permissions = require("../js/").Permissions;
const Role = require("../js/").Role;
const User = require("../js/permissions/roles/user").User;
const Utils = require("../js/").Utils;
const Locale = require("../js/").Locale;

const should = chai.should();

describe("Permissions", function() {
  let LoveRaider;
  let permissions;

  before(function () {
    permissions = new Permissions();

    LoveRaider = new Role({
      name: "Love Raider",
      type: "custom",
      inherits: [ User ],
      permissions: [
        "command:run:love_raider"
      ]
    });
  });

  it("registers roles", function () {
    permissions.should.have.property("roles").that.has.property("User");
    permissions.should.have.property("roles").that.has.property("Regular");
    permissions.should.have.property("roles").that.has.property("Moderator");
    permissions.should.have.property("roles").that.has.property("Owner");
    permissions.should.have.property("roles").that.has.property("Developer");
  });

  it("registers a custom role", function () {
    permissions.registerRole(LoveRaider);
    permissions.should.have.property("roles").that.has.property("Love Raider");

    let Raider = permissions.get("Love Raider");
    Raider.has("command:run:love_raider").should.be.true;
    Raider.type.should.eq("custom");
    Raider.has("user:voice").should.be.true;
    Raider.has("channel:quote:delete").should.be.false;
  });

  it("has role", function () {
    should.exist(permissions.get("Moderator"));
    should.not.exist(permissions.get("Cheese"));
  });

  it("checks role has permission", function() {
    let Mod = permissions.get("Moderator");
    Mod.has("channel:command:edit").should.be.true;
    Mod.has("channel:command:cheese").should.be.false;
  });

  it("checks roles inherits", function () {
    let Mod = permissions.get("Moderator");
    Mod.inherits("Moderator").should.be.true;
    Mod.inherits("User").should.be.true;
    Mod.inherits("Cheese").should.be.false;
  });

  it("gets permission definition", function () {
    Permissions.describe("user:voice").should.eq("Allow the bot to process the users messages.");
    should.not.exist(Permissions.describe("cheese:test"));
  });
});

describe("Utils", function () {
  it("collects string parts", function () {
    let parts = "I am testing the collecting of parts".split(" ");

    (function () {
      Utils.collectParts(parts, "......");
    }).should.throw("Invalid task format");

    Utils.collectParts(parts, "0..").should.eql(parts);
    Utils.collectParts(parts, "1").should.eql([parts[1]]);
    Utils.collectParts(parts, "3..").should.eql(parts.slice(3, parts.length));

    Utils.collectParts(parts, "0-2").should.eql(parts.slice(0, 2));
  });

  it("strips user tagging", function () {
    Utils.stripUserTag("@artdude543").should.eq("artdude543");
    Utils.stripUserTag("#artdude543").should.eq("artdude543");
    Utils.stripUserTag("artdude543").should.eq("artdude543");
  });

  it("strips command prefixing", function () {
    Utils.stripCommand("!", "!cmd").should.eq("cmd");
    Utils.stripCommand(">", "!cmd").should.eq("!cmd");
  });

  it("converts bytes to be human readable", function () {
    Utils.bytesToSize("").should.eq("0 Byte");
    Utils.bytesToSize("").should.be.NaN;

    Utils.bytesToSize(0).should.eq("0 Byte");
    Utils.bytesToSize(10000).should.eq("9.77 KB");
    Utils.bytesToSize(54684646546).should.eq("50.9 GB");
  });
});

describe("Locale", function () {
  it("gets the translation", function () {
    Locale.get("en_US", "command.generic.reply.user").should.eq("@%s, %s");
    Locale.get("cheese", "command.generic.reply.user").should.eq("@%s, %s");
  });

  it("translates the string", function () {
    Locale.translate("en_US", "command.generic.reply.user", "artdude543", "Hey there!").should.eq("@artdude543, Hey there!");
    Locale.translate("en_US", "command.generic.reply.user", "artdude543").should.eq("@artdude543, %s");
    Locale.translate("da_DK", "protection.purge.capsoveruse", "artdude543").should.eq("@artdude543 du blev lige pwnt for at bruge for mange caps!");

    Locale.translate("en_US", "command.generic.execution.string.short", "artdude543", "user name", 10).should.eq("@artdude543 Oops the argument for the user name is too short needs to be at least 10.");
    Locale.translate("en_US", "command.random.tableflip").should.eq("(╯°□°）╯︵ ┻━┻");
  });

  it("formats the string", function () {
    Locale.format("Hey there @%s!", "artdude543").should.eq("Hey there @artdude543!");
    Locale.format("Hey there!", "artdude543").should.eq("Hey there!");

    Locale.format("See numbers! %d", 1).should.eq("See numbers! 1");
  });
});
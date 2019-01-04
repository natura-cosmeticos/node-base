const { assert } = require('chai');
const sinon = require('sinon');
const { App: { Command: BaseCommand } } = require('../../index');

describe('BaseCommand', () => {
  describe('base cases', () => {
    it('should be possible emit and listen an event', () => {
      // given
      const eventName = 'fake';
      const callback = sinon.fake();

      class FakeCommand extends BaseCommand {
        fake() { this.emit(eventName); }
      }

      const fakeCommand = new FakeCommand();

      // when
      fakeCommand.on(eventName, callback);
      fakeCommand.fake();

      // then
      assert.equal(callback.calledOnce, true);
    });
  });

  describe('edge cases', () => {
    it('when two events with the same name are emmited, they should be only in the instance that emitted', () => {
      // given
      class ClassA extends BaseCommand {}
      class ClassB extends BaseCommand {}

      const commandA = new ClassA();
      const commandB = new ClassB();
      const callbackA = sinon.fake();
      const callbackB = sinon.fake();
      const eventName = 'testing';

      // when
      commandA.on(eventName, callbackA);

      commandB.on(eventName, callbackB);

      commandA.emit(eventName);
      commandA.emit(eventName);

      commandB.emit(eventName);

      // then
      assert.equal(callbackA.calledTwice, true);
      assert.equal(callbackB.calledOnce, true);
    });
  });
});

# Installation

```sh
npm i @realism/core
```

or

```sh
yarn add @realism/core
```

# Documentation

The `@realism/core` library is a group of basic react-hooks for more rational appllication data controll in the `React`-world.

## _1. useSlice_

The `useSlice` is a top level utility which creates `slice` of data with different hooks for it's control. `Slice` of data is a plain javascript object which can be passed as a component prop or through React context etc. It simplifies a control over one object unlike multiple separated states wich created via the `useState` hook from the React library.

To create a `slice` we need to describe a type of the slice and set a default value:

```tsx
import { FC, useEffect } from 'react';
import { useSlice, TSlice } from '@realism/core';

type TPerson = {
  name: string;
  age: number;
};

const DEFAULT_PERSON: TPerson = {
  name: '',
  age: 0,
};

const fetchPerson = async () => ({
  name: 'John',
  age: 30,
});

const Person: FC = () => {
  const person = useSlice(DEFAULT_PERSON);

  useEffect(() => {
    fetchPerson().then((data) => {
      person.actions.setState(data);
    });
  }, [person]); // it doesn't matter because of the slice is an immutable object

  return <PersonCard person={person} />;
};

type TPersonCardProps = {
  person: TSlice<TPerson>;
};

const PersonCard: FC<TPersonCardProps> = ({ person }) => {
  const name = person.selectors.useName();

  if (!name) {
    return <span>Loading...</span>;
  }

  return (
    <div>
      <span>My name is {name}!</span>
    </div>
  );
};
```

A `slice` as said before is a javascript object that has 3 properties: `actions`, `selectors` and `getState`. Let's take a closer look at this:

- `actions` allows us to change values inside of the `slice`;
- `selectors` allow us to get values from the `slice` inside of a component and subscribe a component to the slice's data changing;
- `getState` allows us to get values from the `slice` inside simple funtions;

`Actions` is an object with methods for the slice's data changing. It has two common actions and some special actions which depend on the slice's data structure. For example, the slice `Person` from the code above has following actions:

```ts
{
    // Common actions
    setState: (arg0: TPerson) => void;
    cleanState: () => void;
    // Special actions
    setName: (arg0: string) => void;
    setAge: (arg0: number) => void;
}
```

As we can see common actions includes `setState` and `cleanState` actions. `setState` action receives one argument which must be a whole slice's data object. The object will be set to the slice as whole data. `cleanState` action restores slice's data to the default value which was specified during slice creation.

Special actions are formed by concatenating a word `set` with a name of the slice's data property. For example, if we have `name` property the action has name `setName`. A special action receives one argument with type of the property. Thus we have as many special actions as there were properties in the slice's data object.

`Selectors` is an object with react hooks for the getting whole slice's data or separate pieces of it. It's only used inside of a react component or other react hooks. `Selectors` subscribe a react component to slice's data changing. It has one common selector and some special selectors which depend on the slice’s data structure. For example, the slice Person from the code above has following selectors:

```ts
{
  // Common selectors
  useState: () => TPerson;
  // Special selectors
  useName: () => string;
  useAge: () => number;
}
```

Common selector `useState` is used for getting whole slice's data. That's why the selector subscribes a react-component to any property changing. It's better to use special selectors except the case when you need whole slice's data in one component.

Special selectors are formed by concatenating a word `use` with a name of the slice's data property. For example, if we have `name` property the selector has name `useName`. A special selector doesn't receive any arguments and returns value with a type of corresponding data property. Thus we have as many special selectors as there were properties in the slice's data object.

`getState` is a pure function which returns a whole slice's data object. Data is actual on the moment of the `getState` method calling. We shouldn't use `getState` inside of react component or react hooks because of it doesn't subscribe the component to slice's data changing. The method is used inside of callback or methods where we can't use react hooks.

`Important!` A `slice` is an immutable object. It means that a `slice` doesn't rerender a component in which it was created after the slice's data changing. To rerender a component we have to use hooks from the slice's `selectors` object.

## _2. useEmitter_

The `useEmitter` is utility wich creates `emitter`. `Emitter` allows us to subscribe to methods and emit the methods anywhere in an react application. The emitter doesn't use browser events or similar abilities. Inside the emitter only react opportunities are used.

When creating an `emitter` we need to specify a type of methods which we'll use. The type is an object with keys of event names and values of methods. Let's create an `emitter` with two methods:

```ts
import { FC, createContext, useEffect, useCallback, useContext } from 'react';
import { useEmitter, DEFAULT_EMITTER_CONTEXT, TEmitter } from '@realism/core';

type TComponentEmitter = {
    send: (arg0: string) => void;
}

const ComponentContext = createContext<TEmitter<TComponentEmitter>>(DEFAULT_EMITTER_CONTEXT);

const Component: FC = () => {
    const emitter = useEmitter<TComponentEmitter>();

    const onSend = useCallback((value: string) => {
      console.log({ value });
    }, []);

    useEffect(() => {
        return emitter.subscribe('send', onSend);
    }, [
        emitter, // it doesn't matter because of the emmiter is an immutable object
        onSend,
    ]);

    return (
        <ComponentContext.Provider value={emitter}>
            <ComponentChild />
        </ComponentContext.Provider>
    );
};

const ComponentChild: FC = () => {
    const emitter = useContext(ComponentContext);

    const handleClick = useCallback(() => {
        emitter.emit('send', 'clicked');
    }, [emitter]); // it doesn't matter because of the emmiter is an immutable object

    return (
        <button onClick={handleClick}>Click me</button>
    );
};
```

The `emitter` is an object which has three methods:

- `subscribe` is used for regestring a method into the emitter. The `subscribe` method receives two arguments: name and method. It's possible to subscribe several methods using one name. The `subscribe` method returns a function which can be used for unsubscribing the method. That's why the unsubscribing function was returned from the effect's callback in the example above.
- `emit` is used for calling a method which was specified in the `subscribe` method erlier. The `emit` method receives more than one arguments. First argument is required. It specifies a name of the subscribed method. Rest arguments are arguments of the subscried method. The `emit` method retuns nothing. It calls all methods which were subscribed by the `subscribe` method.
- `useRenderingSubscription` is a react hook which is used for regestring a method into the emitter like `subscribe` method. But the `useRenderingSubscription` hook does it during the first component's rendering unlike the `subscribe` method which should be used only in the `useEffect` callback after the first rendering. It solves the problem when we want to use `emit` methods in the `useEffect` of child components. In this case the `useEffect` of the child component will be calld before the `useEffect` of the parent component.

## _3. useRegistry_

The `useRegistry` is utility which creates `registry`. `Registry` allow us to store functions by keys. The utility is used under the hood of the `useEmitter`. `Registry` is an javascript object which has several methods to save, get and remove functions by it's keys:

- `add` method adds a function to the `registry` by a key. It receives two arguments: `key` and `function`. It's allowed to call multiple times the `add` method with the same key. All functions with the same key will be added to one array. The array will gotten by the key using method `get`. `add` method returns a key wich can be used to remove added function.
- `get` method returns an array of functions which were added to the `registry` by the `add` method. The method receives a key wich was used in the `add` method. If we pass unknown key to the `get` method then empty array will be returned without any error.
- `remove` method removes one function by a key which was returned by `add` method.
- `clear` method removes all functions which were added by the `add` method. It receives a key which was specified in the `add` method.

```ts
import { FC, useCallback, useEffect, ChangeEventHandler } from 'react';
import { useRegistry } from '@realism/core';

const CLEAR_KEY = 'clear';

const Component: FC = () => {
    const registry = useRegistry();

    const clearState = useCallback(() => {
      console.log('Clearing...');
    }, []);

    const handleCheck = useCallback<ChangeEventHandler<HTMLInputElement>>(({ target }) => {
        if (target.value) {
            registry.add(CLEAR_KEY, clearState);
        } else {
            registry.clear(CLEAR_KEY);
        }
    }, [
      registry, // it doesn't matter because of the registry is an immutable object
      clearState
    ]);

    useEffect(() => () => {
        const clearingHandlers = registry.get(CLEAR_KEY);

        clearingHandlers.forEach((handler) => {
            handler();
        });
    }, [registry]); // it doesn't matter because of the registry is an immutable object

    return (
        <input type="checkbox" onChange={handleCheck} />
    );
};
```

## _4. useFirstRender_

The `useFirstRender` is a react hook which can be helpfull if we want to do some logic only during the first component render. The hook returns react `ref` object. The `current` property of the object contains a flag about the first rendering.

```ts
import { FC, useEffect, useState } from 'react';
import { useFirstRender } from '@realism/core';

type TComponentProps = {
  data: string;
};

const Component: FC<TComponentProps> = ({ data }) => {
  const isFirstRender = useFirstRender();
  const [localData, setLocalData] = useState(data);

  useEffect(() => {
    if (!isFirstRender.current) {
      setLocalData(data);
    }
  }, [data]);

  return null;
};
```

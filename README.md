The `@realism/core` library is a group of basic react-hooks for more rational appllication data controll in the `React`-world.

## _1. useSlice_

The `useSlice` is a top level utility which creates `slice` of data with different hooks for it's control. `Slice` of data is a plain javascript object which can be passed as a component prop or through React context etc. It simplifies a control over one object unlike multiple separated states wich created via the `useState` hook from the React library.

To create a `slice` we need to describe a type of the slice and set a default value:

```tsx
import { FC, useEffect } from 'react';
import { useSlice, TSlice } from '@realism/core';

import { fetchPerson } from './api';

type TPerson = {
  name: string;
  age: number;
};

const DEFAULT_PERSON: TPerson = {
  name: '',
  age: 0,
};

const Person: FC = () => {
  const person = useSlice(DEFAULT_PERSON);

  useEffect(() => {
    fetchPerson().then(({ name, age }) => {
      person.actions.setState({
        name,
        age,
      });
    });
  }, []);

  return <PersonCard person={person} />;
};

type TPersonCardProps = {
  person: TSlice<TPerson>;
};

const PersonCard: FC<TPersonCardProps> = ({ person }) => {
  const name = person.selectors.useName();

  if (!name) {
    return null;
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

`getState` is a pure function which returns a whole slice's data object. Data is actual on the moment of the `getStatte` calling. We shouldn't use `getState` inside of react component or react hooks because of it doesn't subscribe the component to slice's data changing. The method is used inside of callback or methods where we can't use react hooks.

`Important!` A `slice` is an immutable object. It means that a `slice` doesn't rerender a component in which it was created after the slice's data changing. To rerender a component we have to use hooks from the slice's `selectors` object.
